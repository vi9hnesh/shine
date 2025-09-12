import { LogoIcon } from '@/components/logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Keyboard, 
  Timer, 
  PenTool,
  Wind, 
  Mountain,
  Heart,
  Star,
  FileText,
  Coffee,
  Headphones,
  Newspaper
} from 'lucide-react'
import Link from 'next/link'

export default function ShineHeroSection() {
    return (
        <section>
            <div className="p-12 rounded-t-md">
                <div className="bg-linear-to-t from-background relative z-20 mx-auto max-w-lg space-y-6 from-55% text-center">
                        <h2 className="text-balance text-3xl font-semibold md:text-4xl">Shine</h2>
                        <p className="text-muted-foreground">A collection of mindful tools designed to help teams focus, reflect, and grow together. Take meaningful breaks that restore your energy and creativity.</p>
                </div>
            </div>
            <hr className="mb-6" />
        </section>
    )
}
