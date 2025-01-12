import {Gender} from "../enums/genders";


export class Subject {
    name: string
    age: number
    nationality: string
    gender: Gender

    constructor(name: string, age: number, nationality: string, gender: Gender) {
        this.name = name
        this.age = age
        this.nationality = nationality
        this.gender = gender
    }
}