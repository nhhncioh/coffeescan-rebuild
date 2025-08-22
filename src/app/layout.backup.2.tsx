import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '../lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coffee Scanner - Identify Coffee Bags Instantly',
  description: 'Upload a photo of any coffee bag and instantly identify the roaster, origin, tasting notes, and get personalized recommendations for similar coffees.',
  keywords: ['coffee', 'scanner', 'roaster', 'specialty coffee', 'coffee identification'],
  authors: [{ name: 'Coffee Scanner' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#d97e2a',
  openGraph: {
    title: 'Coffee Scanner - Identify Coffee Bags Instantly',
    description: 'Upload a photo of any coffee bag and get instant coffee identification and recommendations.',
    type: 'website',
    url: 'https://coffeescanner.app',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Coffee Scanner App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coffee Scanner - Identify Coffee Bags Instantly',
    description: 'Upload a photo of any coffee bag and get instant coffee identification and recommendations.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(
        inter.className,
        "min-h-full bg-gradient-to-br from-coffee-50 via-white to-bean-50 antialiased"
      ) + " app-bg" + " app-bg"}>
        <div className="relative min-h-screen">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/coffee-pattern.svg')] opacity-5 pointer-events-none" />
          
          {/* Header */}
          <header className="relative z-10 border-b border-coffee-200/30 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">â˜•</span>
                  </div>
                  <h1 className="text-xl font-bold text-coffee-900">
                    Coffee Scanner
                  </h1>
                </div>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <a 
                    href="/" 
                    className="text-coffee-700 hover:text-coffee-900 transition-colors"
                  >
                    Scanner
                  </a>
                  <a 
                    href="/browse" 
                    className="text-coffee-700 hover:text-coffee-900 transition-colors"
                  >
                    Browse Coffees
                  </a>
                  <a 
                    href="/roasters" 
                    className="text-coffee-700 hover:text-coffee-900 transition-colors"
                  >
                    Roasters
                  </a>
                  <a 
                    href="/about" 
                    className="text-coffee-700 hover:text-coffee-900 transition-colors"
                  >
                    About
                  </a>
                </nav>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-coffee-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-auto border-t border-coffee-200/30 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">â˜•</span>
                    </div>
                    <h2 className="text-lg font-bold text-coffee-900">
                      Coffee Scanner
                    </h2>
                  </div>
                  <p className="text-coffee-600 mb-4 max-w-md">
                    Discover and identify specialty coffees instantly. Upload a photo of any coffee bag 
                    and get detailed information about the roaster, origin, and tasting notes.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.099.120.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.163-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-coffee-900 uppercase tracking-wider mb-4">
                    Features
                  </h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Coffee Scanner</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Roaster Database</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Recommendations</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Reviews</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-coffee-900 uppercase tracking-wider mb-4">
                    Support
                  </h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Contact Us</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-coffee-600 hover:text-coffee-800 transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-coffee-200/30">
                <p className="text-center text-coffee-600">
                  Â© 2024 Coffee Scanner. All rights reserved. Made with â˜• for coffee lovers.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}


