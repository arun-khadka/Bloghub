"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ScrollReveal from "@/components/ScrollReveal"
import { BookOpen, Users, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-primary/10 via-background to-accent/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">About BlogHub</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your trusted source for local news, community stories, and insights that matter. We're dedicated to
                keeping you informed and connected.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  At BlogHub, we believe in the power of storytelling to bring communities together. Our mission is to
                  provide accurate, timely, and engaging content that informs, inspires, and empowers our readers.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're committed to journalistic integrity, diverse perspectives, and giving voice to the stories that
                  shape our community. From local news to arts and culture, we cover what matters most to you.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-foreground text-center mb-12">Our Values</h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <ScrollReveal delay={100}>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Truth & Accuracy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're committed to factual reporting and thorough fact-checking. Every story is verified before
                    publication.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Community First</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our readers are at the heart of everything we do. We listen, engage, and serve the community's
                    needs.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Passion & Purpose</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're passionate about storytelling and driven by the purpose of making a positive impact.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 py-16">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Our diverse team of journalists, writers, and editors brings decades of combined experience in
              storytelling and community engagement.
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={100}>
              <div className="bg-card border border-border rounded-2xl shadow-lg p-8 text-center">
                <p className="text-lg text-muted-foreground mb-6">
                  We're a team of dedicated writers covering everything from local news to arts and culture. Each
                  member brings unique expertise and a shared commitment to quality journalism.
                </p>
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 font-medium"
                >
                  Read Our Stories
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
