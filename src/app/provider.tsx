"use client"

import { MDConnection } from "@motherduck/wasm-client"
import { useState, useEffect, useContext, createContext } from "react"

const DuckDBContext = createContext<{
	isInitialized: boolean
	connection: MDConnection | null
} | null>(null)

const mdToken = process.env.NEXT_PUBLIC_MOTHERDUCK_TOKEN

export function MotherDuckProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [isInitialized, setIsInitialized] = useState(false)
	const [connection, setConnection] = useState<MDConnection | null>(null)

	useEffect(() => {
		if (typeof window === "undefined") {
			console.warn("Attempted to establish connection on the server side.")
			return
		}

		if (!mdToken) {
			console.error("MotherDuck token is not defined.")
			return
		}

		const establishConnection = async () => {
			if (typeof window === "undefined") {
				console.warn("Attempted to establish connection on the server side.")
				return
			}

			if (typeof Worker === "undefined") {
				console.error("Web Workers are not supported in this environment.")
				return
			}

			let _connection: MDConnection | null = null
			try {
				_connection = MDConnection.create({ mdToken })
			} catch (error) {
				console.error("Failed to create DuckDB connection", error)
				return
			}

			const success = await _connection.isInitialized()
			setIsInitialized(success)

			const connectionId = _connection.id

			if (success) {
				console.debug("Initialized DuckDB connection", {
					mdToken,
					connectionId,
				})
			} else {
				console.warn("Failed to initialize DuckDB connection", {
					mdToken,
					connectionId,
				})
			}

			setConnection(_connection)
		}

		establishConnection()
	}, [])

	useEffect(() => {
		return () => {
			connection?.close()
		}
	}, [connection])

	return (
		<DuckDBContext.Provider value={{ isInitialized, connection }}>
			{children}
		</DuckDBContext.Provider>
	)
}

export function useMotherDuck() {
	const context = useContext(DuckDBContext)
	if (!context) {
		throw new Error("useMotherDuck must be used within a MotherDuckProvider")
	}
	return context
}
