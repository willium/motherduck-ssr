"use client"

import { useEffect, useState } from "react"
import { useMotherDuck } from "./provider"
import { DuckDBRow } from "@motherduck/wasm-client"

export default function Page() {
	const md = useMotherDuck()
	const [rows, setRows] = useState<readonly DuckDBRow[]>([])

	useEffect(() => {
		if (!md.connection) {
			console.warn("No connection found")
			return
		}

		if (typeof window === "undefined") {
			console.warn("Attempted to query connection on the server side.")
			return
		}

		if (typeof Worker === "undefined") {
			console.error("Web Workers are not supported while querying.")
			return
		}

		md.connection
			.safeEvaluateQuery(
				`
			select 
				year(created_date)::int as Year, 
				count(*)::int as Complaints
			from 
				sample_data.nyc.service_requests
			where 
				Year < 2023
				and agency_name = 'New York City Police Department'
			group by 
				1
			order by 
				1;`
			)
			.then((result) => {
				if (result.status === "success") {
					const rows = result.result.data.toRows()
					setRows(rows)
					console.log({ rows })
				} else {
					console.error("Query failed with error:", result.err)
				}
			})
			.catch((error) => {
				// Catch any errors that occur during the query execution
				console.error("An error occurred while executing the query:", error)
			})
	}, [md.connection])

	return (
		<div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
			<div
				style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
			>
				Hello World
			</div>
			<div style={{ marginBottom: "20px" }}>
				MotherDuck connection initialized: {md.isInitialized ? "Yes" : "No"}
			</div>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th style={{ border: "1px solid #ccc", padding: "8px" }}>Year</th>
						<th style={{ border: "1px solid #ccc", padding: "8px" }}>
							Complaints
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr key={index}>
							<td style={{ border: "1px solid #ccc", padding: "8px" }}>
								{String(row.Year)}
							</td>
							<td style={{ border: "1px solid #ccc", padding: "8px" }}>
								{String(row.Complaints)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div></div>
		</div>
	)
}
