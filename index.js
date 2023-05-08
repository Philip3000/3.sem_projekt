Vue.createApp({
    data() {
        return {
            baseWeatherApiUrl: 'https://goweather.herokuapp.com/weather/',
            basePriceApiUrl: 'https://www.elprisenligenu.dk/api/v1/prices/',
            city: '',
            year: 0,
            day: 0,
            month: 0,
            priceArea: "_DK2.json",
            weather: {},
            energyPrices: [],
            message: "",
            price: "",
            price2: ""
        }
    },
    async Created() {
        this.GetWeatherByCity()
        this.GetEnergyPrice()
    },
    methods: {
        async GetWeatherByCity() {
            try {
                const response = await axios.get(this.baseWeatherApiUrl + this.city)
                this.weather = response.data
            }
            catch (ex) {
                alert(ex.message)
            }
        },
        async messageGiver() {
            this.GetEnergyPrice()
            this.price2 = this.price
            if (this.price2 > 1) {
                this.message = "Prisen er høj"
            }
            if (this.price2 < 1) {
                this.message = "prisen er god"
            }
        },
        async GetEnergyPrice() {
            try {
                const date = new Date()
                this.year = date.getFullYear()
                this.day = String(date.getDate()).padStart(2, '0')
                this.month = String(date.getMonth() + 1).padStart(2, '0')
                const response = await axios.get(this.basePriceApiUrl + this.year + '/' + this.month + '-' + this.day + this.priceArea)
                this.energyPrices = response.data
                this.CalculateAveragePrice()
                this.messageGiver()
            }
            catch(ex) {
                alert(ex.message)
            }
        },
        async CalculateAveragePrice() {
            let avgDKK = 0
            for (let i = 0; i < this.energyPrices.length; i++) {
                avgDKK += this.energyPrices[i].DKK_per_kWh
            }
            this.price = avgDKK / this.energyPrices.length
            this.price = this.price.toFixed(2)
        }
    },
}).mount("#app")