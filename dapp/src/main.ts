import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import logo from './assets/logo.svg';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const app = createApp(App)
app.use(createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark'
    },
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            soraLogo: logo
        },
        sets: {
            mdi
        }

    }
}));
app.use(createPinia())

app.mount('#app')
