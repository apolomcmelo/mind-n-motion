export class Vehicle {
    type: string
    brand: string
    model: string
    powerInCv: number

    constructor(type: string, brand: string, model: string, powerInCv: number) {
        this.type = type
        this.brand = brand
        this.model = model
        this.powerInCv = powerInCv
    }
}