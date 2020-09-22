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

type HelloWorld = ReturnType<typeof setupHelloWorld>

export { HelloWorldProps, HelloWorld, setupHelloWorld }
