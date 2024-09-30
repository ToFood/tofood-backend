export class Product {
    constructor(
        public _id: string,
        public name: string,
        public category: string,
        public price: number,
        public description: string,
        public image: string
    ) { }
}