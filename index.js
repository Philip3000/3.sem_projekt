Vue.createApp({
    data() {
        return {
            baseRaspberryPiApiUrl: 'https://ecosaver20230509124002.azurewebsites.net/api/Weather',
            baseWeatherApiUrl: 'https://goweather.herokuapp.com/weather/',
            basePriceApiUrl: 'https://www.elprisenligenu.dk/api/v1/prices/',
            baseGreenEnergyApiUrl: 'https://api.energidataservice.dk/dataset/ElectricityBalanceNonv?limit=2',
            ipApiUrl: 'https://api.ipify.org?format=json',
            geoApiUrl: 'https://ipapi.co/',
            city: '',
            year: 0,
            day: 0,
            month: 0,
            priceArea: "_DK2.json",
            weatherApiData: {},
            weatherIpApiData: {},
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
            temp: "",
            humi: "",
            restApiData: [],
            outdoorDryMessage: "",
            locationCity: "",
            ipAddress: "",
            locationWeatherMessage: "",
            averageForDay: 0,
            averageMessage: "",
            averagePriceDay1: 0,
            averagePriceDay2: 0,
            averagePriceDay3: 0,
            averagePriceDay4: 0,
            averagePriceDay5: 0,
            averagePriceDay6: 0,
            averagePriceDay7: 0,
            weeklyAverage: 0,
            counter: 0,
        }
    },
    async created() {
        await this.GetEnergyPrice()
        await this.GetLocationWeather()
        await this.GetRaspberryApi()
        await this.CalculateAveragePrice()
        setInterval(async () => {
            await this.GetLocationWeather();
        }, 6000000); //Opdatere hvert 'x' millisekund, vejret på ens lokation
        this.createChart()

    },
    methods: {
        //Henter ip addressen
        async GetIpLocation() {
            const response = await axios.get(this.ipApiUrl)
            this.ipAddress = response.data.ip
        },
        //Får by lokation baseret på ip addressen
        async GetCityLocation() {
            this.GetIpLocation()
            const response = await axios.get(this.geoApiUrl + this.ipAddress + "/json/")
            this.locationCity = response.data.city
            this.locationCity = this.locationCity.replace(/\s+/g, "-");
        },
        //Får vejret fra ens lokation
        async GetLocationWeather() {
            try {
                await this.GetIpLocation()
                await this.GetCityLocation()
                const response = await axios.get(this.baseWeatherApiUrl + this.locationCity)
                this.weatherIpApiData = response.data
                this.weatherFromIp = this.weatherIpApiData.description.toLowerCase()
                if (this.weatherFromIp.includes("rain")) {
                    this.locationWeatherMessage = "Det regner, skynd dig at tage tøj ind! "
                    alert("Det regner, tag tøj ind")
                }
                else if (this.weatherFromIp.includes("sunny")) {
                    this.locationWeatherMessage = "Solen skinner og alt er fint"
                }
                else if (this.weatherFromIp.includes("cloud")) {
                    this.locationWeatherMessage = "Det er skyet i dag, tøjet vil tørre langsomt udenfor i dag"
                }
            }
            catch (ex) {
                alert(ex.message)
            }
        },
        //Henter temperatur og data fra raspberry pi api'en
        async GetRaspberryApi() {
            try {
                const response = await axios.get(this.baseRaspberryPiApiUrl)
                this.restApiData = response.data
                this.temp = this.restApiData[0].temperature.toFixed(2)
                this.humi = this.restApiData[0].humidity.toFixed(2)
                if (this.temp > 15 && this.humi < 40 && this.weather.includes("sunny")) {
                    this.outdoorDryMessage = "Du kan spare på miljøet i dag ved at hænge tøjet udenfor"
                }
                if (this.temp < 15 || this.humi > 40 || !this.weather.includes("sunny")) {
                    this.outdoorDryMessage = "Du bør ikke hænge tøjet udenfor"
                }
            }
            catch (ex) {
                alert(ex.message)
            }

        },
        //Får vejret baseret på byvalget fra dropdown menuen fra html siden
        async GetWeatherByCity() {
            try {
                const response = await axios.get(this.baseWeatherApiUrl + this.city)
                this.weatherApiData = response.data
                this.weather = this.weatherApiData.description.toLowerCase()
                if (this.weather.includes("rain")) {
                    this.rainWarning = "Det regner"
                    this.warning = 'regner'
                }
                else if (this.weather.includes("sunny")) {
                    this.rainWarning = "Dejligt vejr at tørre tøj udenfor"
                    this.warning = 'sol'
                }
            }
            catch (ex) {
                alert(ex.message)
            }
        },
        messageGiver() {
            if (this.priceAtHour > this.averageForDay) {
                this.message = "Prisen er høj lige nu";
                
            }
            if (this.priceAtHour < this.averageForDay) {
                this.message = "Prisen er lav lige nu";
            }
        },
        //Får energipriserne for de sidste 7 dage
        async GetEnergyPrice() {
            try {
                //Gets the date
                this.currentDate = new Date();
                this.currentDay = this.currentDate.getDate();
                this.currentMonth = this.currentDate.getMonth();
                this.currentYear = this.currentDate.getFullYear();
                let totalAverage = 0
                //Iterates over the last seven days
                for (let test = 0; test < 7; test++) {
                    this.date = new Date(this.currentYear, this.currentMonth, this.currentDay - test); //For each day, it gets the previous day
                    this.year = this.date.getFullYear();
                    this.day = String(this.date.getDate()).padStart(2, '0');
                    this.month = String(this.date.getMonth() + 1).padStart(2, '0');
                    const response = await axios.get(this.basePriceApiUrl + this.year + '/' + this.month + '-' + this.day + this.priceArea);
                    this.energyPrices = response.data;
                    //Calculates the average energyprice of each day
                    let avgDKK = 0
                    for (let i = 0; i < this.energyPrices.length; i++) {
                        avgDKK += this.energyPrices[i].DKK_per_kWh
                    }
                    let price = avgDKK / this.energyPrices.length
                    price = price.toFixed(2)
                    this.averagePrice = price
                    totalAverage += parseFloat(price);
                    this.AssignAveragePrice(this.averagePrice, test); //Assigns each day it's own average value
                }
                //Gets a total average for the past week
                this.weeklyAverage = totalAverage / 7
                this.weeklyAverage = this.weeklyAverage.toFixed(2)
                //this.messageGiver();
            } catch (ex) {
                alert(ex.message);
            }
        },
        //Skaber søjlediagrammet
        createChart() {
            let chartDate = new Date();
            const chartData = [{
                x: [chartDate.getDate(), chartDate.getDate() - 1, chartDate.getDate() - 2, chartDate.getDate() - 3, chartDate.getDate() - 4, chartDate.getDate() - 5, chartDate.getDate() - 6],
                y: [
                    this.averagePriceDay1,
                    this.averagePriceDay2,
                    this.averagePriceDay3,
                    this.averagePriceDay4,
                    this.averagePriceDay5,
                    this.averagePriceDay6,
                    this.averagePriceDay7
                ],
                type: 'bar'
            }];

            const layout = {
                title: 'Gennemsnit de sidste 7 dage i DKK',
                xaxis: {
                    title: 'Dato: Dag i måned',
                },
                yaxis: {
                    title: 'Gennemsnits pris',
                },
            };

            Plotly.newPlot('myDiv', chartData, layout);

        },
        //Tildeler gennemsnittet fra GetEnergyPrice til dagene der har været den sidste uge
        AssignAveragePrice(averagePrice, dayIndex) {
            switch (dayIndex) {
                case 0:
                    this.averagePriceDay1 = averagePrice;
                    break;
                case 1:
                    this.averagePriceDay2 = averagePrice;
                    break;
                case 2:
                    this.averagePriceDay3 = averagePrice;
                    break;
                case 3:
                    this.averagePriceDay4 = averagePrice;
                    break;
                case 4:
                    this.averagePriceDay5 = averagePrice;
                    break;
                case 5:
                    this.averagePriceDay6 = averagePrice;
                    break;
                case 6:
                    this.averagePriceDay7 = averagePrice;
                    break;
                default:
                    break;
            }
        },
        //Beregner gennemsnittet for den dag
        async CalculateAveragePrice() {
            let todaysDate = new Date()
            let todaysYear = todaysDate.getFullYear();
            let todaysDay = String(todaysDate.getDate()).padStart(2, '0');
            let todaysMonth = String(todaysDate.getMonth() + 1).padStart(2, '0');
            const response = await axios.get(this.basePriceApiUrl + todaysYear + '/' + todaysMonth + '-' + todaysDay + this.priceArea);
            let todaysEnergyPrices = response.data;
            let avgDKK = 0
            for (let i = 0; i < todaysEnergyPrices.length; i++) {
                avgDKK += todaysEnergyPrices[i].DKK_per_kWh
            }
            let price = avgDKK / this.energyPrices.length
            this.averageForDay = price.toFixed(2)
            if (this.averageForDay < this.weeklyAverage) {
                this.averageMessage = "Prisen er god"
            }
            else if (this.averageForDay > this.weeklyAverage) {
                this.averageMessage = "Prisen er ikke særlig god"
            }
        },
        async ShowPriceForHour() {
            this.priceAtHour = this.energyPrices[this.hour].DKK_per_kWh
            this.priceAtHour = this.priceAtHour.toFixed(2)
            this.messageGiver()
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
        },
        Counter() {
            this.counter = this.counter + 1
        },
        NoButton() {
            alert("Det er vi kede af at høre, vi håber vi kan hjælpe i morgen :)")
        }
    },
}).mount("#app")
