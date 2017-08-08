package rendering.core

import akka.actor.{ActorRef, ActorSystem, Props}
import model.ApplicationContext
import rendering.Renderable
import akka.pattern.ask
import akka.routing.RoundRobinPool
import akka.util.Timeout
import common.Logging
import play.api.Mode
import play.twirl.api.Html

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class Renderer(implicit actorSystem: ActorSystem, executionContext: ExecutionContext, ac: ApplicationContext) extends JavascriptCompiler with Logging {

  //TODO: ensure bundle file exists
  val javascriptRendering: Option[JavascriptRendering] =
    compile("ui.bundle.server.js")
      .toOption
      .map(cs => new JavascriptRendering(cs))

  lazy val maybeActor: Option[ActorRef] = javascriptRendering.map { jsRenderer =>
    val renderingActorCount = 3
    actorSystem.actorOf(Props(classOf[RenderingActor], jsRenderer).withRouter(RoundRobinPool(renderingActorCount)))
  }

  val timeoutValue: Int = if(ac.environment.mode == Mode.Dev) 10 else 1
  implicit val timeout = Timeout(timeoutValue.seconds)

  def render[R <: Renderable](renderable: R): Future[Html] = {
    maybeActor.map { actor =>
      (actor ? Rendering(renderable))
        .mapTo[Try[String]]
        .recover { case t => Try(throw t)}
        .map {
          _ match {
            case Success(s) => Html(s)
            case Failure(f) =>
              log.error(f.getLocalizedMessage)
              throw f
          }
        }
    }
    .getOrElse(Future.failed(new RuntimeException("Error: No rendering actor")))
  }

}

