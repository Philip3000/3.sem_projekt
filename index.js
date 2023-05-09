Vue.createApp({
    data() {
        return {
            baseWeatherApiUrl: 'https://goweather.herokuapp.com/weather/',
            basePriceApiUrl: 'https://www.elprisenligenu.dk/api/v1/prices/',
            baseGreenEnergyApiUrl: 'https://api.energidataservice.dk/dataset/ElectricityBalanceNonv?limit=2',
            city: '',
            year: 0,
            day: 0,
            month: 0,
            priceArea: "_DK2.json",
            weather: {},
            energyPrices: [],
            message: "",
            price: "",
            price2: "",
            hour: "",
            priceAtHour: 0,
            rain: "",
            rainWarning: "",
            warning: "",
            allGood: "",
            greenEnergy: [],
            fossilCoal: 0.0,
            fossilOil: 0.0,
            fossilGas: 0.0,
            filteredObject: {},
            totalFossilEnergy: 0.0,
            EnergyMessage: "",
        }
    },
    async Created() {
        this.GetEnergyPrice()
        this.GetWeatherByCity()
        this.CalculateAveragePrice()
        this.ShowPriceForHour()
        this.ShowGreenEnergy()
    },
    methods: {
        async GetWeatherByCity() {
            try {
                const response = await axios.get(this.baseWeatherApiUrl + this.city)
                this.weather = response.data
                this.rain = this.weather.description.toLowerCase()
                if (this.rain.includes("rain")) {
                    this.rainWarning = "Det regner"
                    this.warning = 'regner'
                    //alert(this.rainWarning)
                    //this.thumbSource = "https://cdn.pixabay.com/photo/2013/07/13/10/32/good-157436_1280.png"
                }
                else if (this.rain.includes("sunny")) {
                    this.rainWarning = "Dejligt vejr at tørre tøj udenfor"
                    this.warning = 'sol'
                    //alert(this.rainWarning)
                    //this.thumbSource = "https://cdn.pixabay.com/photo/2013/07/13/10/32/bad-157437_1280.png"
                }
            }
            catch (ex) {
                ex.message = "Error 404: No city selected"
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
                //this.ShowPriceForHour()
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
        },
        async ShowPriceForHour() {
            this.priceAtHour = this.energyPrices[this.hour].DKK_per_kWh
            this.priceAtHour = this.priceAtHour.toFixed(2)
        },
        async CheckForPriceArea() {

        },
        async ShowGreenEnergy() {
            const response = await axios.get(this.baseGreenEnergyApiUrl)
            this.greenEnergy = response.data.records
            this.filteredObject = this.greenEnergy.find(Object => Object.PriceArea === "DK2")
            this.fossilGas = this.filteredObject.FossilGas
            this.fossilCoal = this.filteredObject.FossilHardCoal
            this.fossilOil = this.filteredObject.FossilOil
            this.totalFossilEnergy = this.fossilGas + this.fossilCoal + this.fossilOil
            this.totalFossilEnergy = Math.round(this.totalFossilEnergy)
            if (this.totalFossilEnergy >= 200) {
                this.EnergyMessage = "Advarsel: Ikke klimavenlig strøm: "
            }
            else if (this.totalFossilEnergy < 200 && this.totalFossilEnergy > 100) {
                this.EnergyMessage = "Energien er rimelig grøn: "
            }
            else {
                this.EnergyMessage = "Energien er meget grøn: "
            }
        }
    },
}).mount("#app")