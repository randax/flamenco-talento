import React from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { About } from './components/About'
import { Pedagog } from './components/Pedagog'
import { Timeplan } from './components/Timeplan'
import { Pris } from './components/Pris'
import { Nyheter } from './components/Nyheter'
import { Gallery } from './components/Gallery'
import { Footer } from './components/Footer'
export function App() {
  return (
    <div className="min-h-screen bg-flamenco-dark text-flamenco-light font-sans selection:bg-flamenco-red selection:text-white">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Pedagog />
        <Timeplan />
        <Pris />
        <Gallery />
        <Nyheter />
      </main>
      <Footer />
    </div>
  )
}
