import { Icon } from "lucide-react"
import { Card, CardContent } from "../ui/card"

export default function StatCard({ iconBg, iconColor, title, value, subtitle, icon }: any) {


    const Icon = icon;
    return (
        <Card>
            <CardContent className="flex items-center gap-2 p-3">
                <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg}`}
                >
                    <Icon className={iconColor} size={30} strokeWidth={2} />
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>

                    <h3 className="text-4xl font-bold tracking-tight">
                        {value}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            </CardContent>
        </Card >
    )
}