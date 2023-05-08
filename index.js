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
            weather: {temperature: "", description: "", forecast: ""},

        }
    },
    async Created() {
        this.GetWeatherByCity()
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
        }
        async GetEnergyPrice() {
            try {
                this.year = new Date().getFullYear()
                const response = await axios.get
            }
        }
    },
}).mount("#app")