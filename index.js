Vue.createApp({
    data() {
        return {
            baseRaspberryPiApiUrl:"https://ecosaver20230509124002.azurewebsites.net/api/Weather",
            baseWeatherApiUrl: 'https://goweather.herokuapp.com/weather/',
            basePriceApiUrl: 'https://www.elprisenligenu.dk/api/v1/prices/',
            baseGreenEnergyApiUrl: 'https://api.energidataservice.dk/dataset/ElectricityBalanceNonv?limit=2',
            city: '',
            year: 0,
            day: 0,
            month: 0,
            priceArea: "_DK2.json",
            weatherApiData: {},
            energyPrices: [],
            message: "",
            price: "",
            price2: "",
            hour: "",
            priceAtHour: 0,
            weather: "",
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
            temp:"",
            humi:"",
            restApiData:[],
            outdoorDryMessage: "",
        }
    },
    async created() {
        await this.GetEnergyPrice()
        await this.GetRaspberryApi()
        //await this.GetWeatherByCity()
        await this.CalculateAveragePrice()
        await this.ShowPriceForHour()
        await this.ShowGreenEnergy()
    },
    methods: {
        async GetRaspberryApi(){
            try{
                const response = await axios.get(this.baseRaspberryPiApiUrl)
                this.restApiData = response.data
                this.temp = this.restApiData[0].temperature.toFixed(2)
                if(this.temp > 15 && this.humi < 30 && this.weather.includes("sunny")){
                    this.outdoorDryMessage = "Du kan spare på miljøet i dag ved at hænge tøjet udenfor"
                }
                if(this.temp < 15 || this.humi > 30 || !this.weather.includes("sunny")) {
                    this.outdoorDryMessage = "Du bør ikke hænge tøjet udenfor"
                }
                this.humi = this.restApiData[0].humidity.toFixed(2)

            }
            catch(ex)
            {
              alert(ex.message)
            }

        },
        async GetWeatherByCity() {
            try {
                const response = await axios.get(this.baseWeatherApiUrl + this.city)
                this.weatherApiData = response.data
                this.weather = this.weather.description.toLowerCase()
                if (this.weather.includes("rain")) {
                    this.rainWarning = "Det regner"
                    this.warning = 'regner'
                }
                else if (this.weather.includes("sunny")) {
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
            const messageElement = document.getElementById("card3");
            if (this.price2 > 1) {
                this.message = "PRISEN ER HØJ !!";
                messageElement.style.color="red";
            }
            if (this.price2 < 1) {
                this.message = "PRISEN ER GOD";
                messageElement.style.color="green";
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
            catch (ex) {
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