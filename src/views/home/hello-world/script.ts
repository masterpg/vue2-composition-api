import { SetupContext } from '@vue/composition-api'

interface HelloWorldProps {
  msg: string
}

function setupHelloWorld(props: HelloWorldProps, context: SetupContext) {
  const hello = () => {
    console.log(`Hello World!`)
  }

  return {
    hello,
  }
}

type HelloWorld = ReturnType<typeof setupHelloWorld>

export { HelloWorldProps, HelloWorld, setupHelloWorld }
