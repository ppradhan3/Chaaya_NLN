// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Chhaya छाया',
//   description: 'Your shadow knows before you do',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900`}>
//         <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-xl">🌑</span>
//             <span className="font-semibold text-gray-900 tracking-tight">
//               Chhaya <span className="text-gray-400 font-normal text-sm">छाया</span>
//             </span>
//           </div>
//           <div className="flex gap-6 text-sm text-gray-400">
//             <a href="/" className="hover:text-gray-700 transition">Home</a>
//             <a href="/checkin?user=demo_maya" className="hover:text-gray-700 transition">Check in</a>
//             <a href="/dashboard?user=demo_maya" className="hover:text-gray-700 transition">Dashboard</a>
//             <a href="/insight?user=demo_maya" className="hover:text-gray-700 transition">Insight</a>
//           </div>
//         </nav>
//         <main>{children}</main>
//         <footer className="text-center py-8 text-xs text-gray-300">
//           Chhaya is a behavioral tracking tool, not a medical application.
//           If you are struggling, text HOME to 741741.
//         </footer>
//       </body>
//     </html>
//   )
// }


import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       'Chhaya छाया',
  description: 'Your shadow knows before you do',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}