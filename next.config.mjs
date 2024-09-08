/** @type {import('next').NextConfig} */
const nextConfig = {
	headers: async () => {
		return [
			{
				source: "/:path*", // TODO: limit it to /api routes eventually?
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "require-corp",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Authorization, Content-Type",
					},
				],
			},
		]
	},
}

export default nextConfig
