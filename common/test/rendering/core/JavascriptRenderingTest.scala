package rendering.core

import java.io.FileNotFoundException
import helpers.ExceptionMatcher
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try

class JavascriptRenderingTest
  extends FlatSpec
  with Matchers
  with ExceptionMatcher
  with JavascriptCompiler {

  "Rendering" should "return correct HTML string" in {
    val renderer = new JavascriptRendering(compile("components/TestButtonComponent.js").get)
    val state: Option[JsObject] = Some(JsObject(Seq("title" -> JsString("my title"))))
    renderer.render(state) should be (Try("<button type='button'>my title</button>"))
  }

}
