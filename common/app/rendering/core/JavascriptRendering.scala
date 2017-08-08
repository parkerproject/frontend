package rendering.core

import javax.script.{CompiledScript, SimpleScriptContext}

import common.Logging
import play.api.libs.json.{JsValue, Json}
import rendering.core.JavascriptEngine.EvalResult

import scala.util.Try

class JavascriptRendering(compiledScript: CompiledScript) extends Logging {

  private implicit val scriptContext = createContext()

  private val memoizedJs: Try[EvalResult] = JavascriptEngine.eval(compiledScript)

  def render(props: Option[JsValue] = None): Try[String] = {
    for {
      propsObject <- encodeProps(props)
      js <- memoizedJs
      rendering <- JavascriptEngine.invoke(js, "render", propsObject)
    } yield rendering
  }


  private def createContext(): SimpleScriptContext = {
    val context = new SimpleScriptContext()
    JavascriptEngine.put("__play_webpack_logger", log.logger)(context) // Binding webpack logger to scala logger
    context
  }

  private def encodeProps(props: Option[JsValue] = None): Try[EvalResult] = {
    val propsId = "props"
    val emptyJson = Json.obj()
    for {
      _ <- JavascriptEngine.put(propsId, props.getOrElse(emptyJson))
      propsObject <- JavascriptEngine.eval(s"JSON.parse($propsId)")
    } yield propsObject
  }
}
