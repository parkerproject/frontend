package rendering.core

import java.io._
import java.nio.charset.StandardCharsets
import javax.script.CompiledScript

import scala.util.{Failure, Success, Try}

trait JavascriptCompiler {

  def compile(javascriptFile: String): Try[CompiledScript] = for {
    inputStream <- loadFile(javascriptFile)
    cs <- compile(inputStream)
  } yield {
    cs
  }

  private def compile(inputStream: InputStream): Try[CompiledScript] = {
    val fullScript = new InputStreamReader(new SequenceInputStream(prescript, inputStream))
    JavascriptEngine.compile(fullScript)
  }

  // Nashorn is only a JavaScript engine, i.e. an implementation of the ECMAScript 5.1 language specification.
  // This means that global JavaScript functions such as setTimeout, setInterval and console do not exist natively in Nashorn.
  // Therefore we need to define them manually
  private def prescript: ByteArrayInputStream = {
    val pre =
      """
        |var global = global || this, self = self || this, window = window || this;
        |
        |var console = {};
        |
        |var logger = function(type) {
        |  return function () {
        |    for (var i = 0, len = arguments.length; i < len; i++) {
        |      __play_webpack_logger[type](arguments[i]);
        |    }
        |  }
        |};
        |console.debug = logger("debug");
        |console.warn = logger("warn");
        |console.error = logger("error");
        |console.log = logger("info");
        |console.trace = logger("trace");
        |
        |global.setTimeout = function(fn, delay) {
        |  return __play_webpack_setTimeout.apply(fn, delay || 0);
        |};
        |
        |global.clearTimeout = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
        |
        |global.setImmediate = function(fn) {
        |  return __play_webpack_setTimeout.apply(fn, 0);
        |};
        |
        |global.clearImmediate = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
      """
        .stripMargin
    new ByteArrayInputStream(pre.getBytes(StandardCharsets.UTF_8))
  }

  private def loadFile(fileName: String): Try[InputStream] = {
    Option(getClass.getClassLoader.getResourceAsStream(fileName)) match {
      case Some(stream) => Success(stream)
      case None => Failure(new FileNotFoundException(s"${this.getClass.getSimpleName}: Cannot find file '$fileName'. Have you run `make ui-compile`?"))
    }
  }
}

