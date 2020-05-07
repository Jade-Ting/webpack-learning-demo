import './index.less'
import other from '../public/js/other'

class Animal {
    
    constructor(name) {
        this.name = name
    }

    getName() {
        return this.name
    }
}

const dog = new Animal('dog')
console.log('aaaaa')
other()

