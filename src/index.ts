import * as Core from "@actions/core"

const inputName = Core.getInput("name")

greet(inputName)

function greet(name: string) {
    console.log(`'Hello ${name}!'`)
}

console.log('Hello World!')