import { SetupContext } from '@vue/composition-api'

interface HelloWorldProps {
  title: string
}

function setupHelloWorld(props: HelloWorldProps, context: SetupContext) {
  const hello = () => {
    return `Hello World! ${props.title}.`
  }

  return {
    hello,
  }
}

type HelloWorldFuncs = ReturnType<typeof setupHelloWorld>

type HelloWorld = HelloWorldFuncs & Vue

export { HelloWorld, HelloWorldProps, HelloWorldFuncs, setupHelloWorld }
