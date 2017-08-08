package rendering.core

import javax.script.CompiledScript

import akka.actor.Actor
import rendering.Renderable

import scala.util.Try

case class Rendering(renderable: Renderable, maybeCompiledScript: Option[CompiledScript] = None)

case class RenderingException(error: String) extends RuntimeException(error)

class RenderingActor(javascriptRendering: JavascriptRendering) extends Actor {

  override def receive: Receive = {
    case Rendering(renderable, cs) => sender ! javascriptRendering.render(renderable.props)
    case  _ => sender ! Try(throw new RenderingException("RenderingActor received an unknown message"))
  }

}
