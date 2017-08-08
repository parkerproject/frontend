package rendering.core

import java.io.FileNotFoundException
import javax.script.CompiledScript

import helpers.ExceptionMatcher
import org.scalatest.{FlatSpec, Matchers}

import scala.util.{Failure, Success, Try}

class JavascriptCompilerTest
  extends FlatSpec
    with Matchers
    with ExceptionMatcher {

  lazy val compiler = new JavascriptCompiler {}

  "Compiling" should "return a CompiledScript" in {
    compiler.compile("components/TestButtonComponent.js") match {
      case Failure(f) => fail(f.getLocalizedMessage)
      case Success(cs) => cs should be(an[CompiledScript])
    }
  }

  it should "return None if javascript file doesn't exist" in {
    compiler.compile("does/not/exist.js") should failAs(classOf[FileNotFoundException])
  }

}

