"use client"

import type { MDConnection } from "@motherduck/wasm-client"
import { useState, useEffect, useContext, createContext } from "react"

// Create a context for DuckDB
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
			if (typeof Worker === "undefined") {
				console.error("Web Workers are not supported in this environment.")
				return
			}

			let MDConnection:
				| typeof import("@motherduck/wasm-client").MDConnection
				| null = null
			try {
				// Dynamically import MDConnection
				MDConnection = await import("@motherduck/wasm-client").then(
					(mod) => mod.MDConnection
				)
				if (!MDConnection) {
					console.error("Failed to load MDConnection")
					return
				}
				const _connection = MDConnection.create({ mdToken })

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
			} catch (error) {
				console.error("Failed to create DuckDB connection", error)
			}
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
