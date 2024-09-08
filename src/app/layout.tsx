import "./globals.css"
import { MotherDuckProvider } from "./provider"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<MotherDuckProvider>
			<html lang="en">
				<body>{children}</body>
			</html>
		</MotherDuckProvider>
	)
}
