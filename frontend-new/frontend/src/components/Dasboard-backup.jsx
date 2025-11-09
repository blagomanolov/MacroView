import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#FF6384"];

export default function Dashboard({ onBack }) {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryInfo, setCountryInfo] = useState(null);

    // GDP state
    const [gdpData, setGdpData] = useState([]);
    const [gdpPage, setGdpPage] = useState(1);
    const gdpPerPage = 10;

    // Export state
    const [exportData, setExportData] = useState([]);
    const [exportPage, setExportPage] = useState(1);
    const exportPerPage = 10;

    const [filters, setFilters] = useState({
        year: "",
        exportTo: "",
        product: "",
    });

    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    // Fetch all countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("http://localhost:8000/countries/?limit=300");
                if (!response.ok) throw new Error("Failed to load countries");
                const data = await response.json();
                setCountries(data);
            } catch (err) {
                console.error(err);
                alert("Could not load countries");
            }
        };
        fetchCountries();
    }, []);

    // Fetch country info, GDP, exports
    useEffect(() => {
        if (!selectedCountry) {
            setCountryInfo(null);
            setGdpData([]);
            setExportData([]);
            return;
        }

        setCountryInfo(null);
        setGdpData([]);
        setExportData([]);
        setGdpPage(1);
        setExportPage(1);
        setFilters({ year: "", exportTo: "", product: "" });
        setSortConfig({ key: "", direction: "asc" });

        const fetchData = async () => {
            try {
                const countryRes = await fetch(`http://localhost:8000/countries/${selectedCountry}/?limit=300`);
                if (!countryRes.ok) throw new Error("Failed to load country info");
                const countryJson = await countryRes.json();
                setCountryInfo(countryJson);

                const gdpRes = await fetch(`http://localhost:8000/gdp/${countryJson.country_code}/?limit=1000`);
                const gdpJson = gdpRes.ok ? await gdpRes.json() : [];
                setGdpData(gdpJson);

                const exportRes = await fetch(`http://localhost:8000/exports/country/${countryJson.country_code}/?limit=1000000`);
                const exportJson = exportRes.ok ? await exportRes.json() : [];
                setExportData(exportJson);

            } catch (err) {
                console.error(err);
                alert("Failed to load data");
            }
        };

        fetchData();
    }, [selectedCountry]);


    // GDP chart data
    const gdpChartData = gdpData
        .filter(d => d.gdp_value !== null && d.gdp_value !== undefined)
        .map(d => ({ year: Number(d.year), gdp: Number(d.gdp_value) }))
        .sort((a, b) => a.year - b.year);
    const gdpChartDataLimited = gdpChartData.slice(-20);

    // GDP pagination
    const totalGdpPages = Math.ceil(gdpData.length / gdpPerPage);
    const displayedGdp = gdpData.slice((gdpPage - 1) * gdpPerPage, gdpPage * gdpPerPage);

    // Exports: filtering & sorting
    const filteredExports = exportData
        .filter(ex =>
            (!filters.year || String(ex.year) === String(filters.year)) &&
            (!filters.exportTo || ex.export_to?.toLowerCase().includes(filters.exportTo.toLowerCase())) &&
            (!filters.product || ex.product?.toLowerCase().includes(filters.product.toLowerCase()))
        )
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aVal = a[sortConfig.key] ?? "";
            const bVal = b[sortConfig.key] ?? "";
            if (typeof aVal === "number" && typeof bVal === "number") return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
            return sortConfig.direction === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });

    const totalExportPages = Math.ceil(filteredExports.length / exportPerPage);
    const displayedExports = filteredExports.slice((exportPage - 1) * exportPerPage, exportPage * exportPerPage);

    // Filtered exports for charts excluding 'All Products'
    const filteredForCharts = filteredExports.filter(ex => ex.product !== "  All Products");

    // Top 5 Destination Countries
    const topCountriesData = Object.values(
        filteredForCharts.reduce((acc, cur) => {
            if (!cur.export_to || !cur.export_value_usd_thousand) return acc;
            if (!acc[cur.export_to]) acc[cur.export_to] = { name: cur.export_to, value: 0 };
            acc[cur.export_to].value += cur.export_value_usd_thousand;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value).slice(0, 5);

    // Top 5 Products
    const topProductsData = Object.values(
        filteredForCharts.reduce((acc, cur) => {
            if (!cur.product || !cur.export_value_usd_thousand) return acc;
            if (!acc[cur.product]) acc[cur.product] = { name: cur.product, value: 0 };
            acc[cur.product].value += cur.export_value_usd_thousand;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value).slice(0, 5);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            <h2>Main Dashboard</h2>
            <button onClick={onBack}>← Back</button>

            {/* COUNTRY SELECT */}
            <div style={{ marginTop: "1rem" }}>
                <label htmlFor="country">Select Country:</label>
                <select
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
                >
                    <option value="">-- Choose a country --</option>
                    {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>




            {/* COUNTRY INFO */}
            {countryInfo && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Country Information</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <tbody>
                            <tr><th>Name</th><td>{countryInfo.name}</td></tr>
                            <tr><th>Country Code</th><td>{countryInfo.country_code}</td></tr>
                            <tr><th>Capital</th><td>{countryInfo.capital}</td></tr>
                            <tr><th>Region</th><td>{countryInfo.region}</td></tr>
                            <tr><th>Subregion</th><td>{countryInfo.subregion}</td></tr>
                            <tr><th>Population</th><td>{countryInfo.population?.toLocaleString()}</td></tr>
                            <tr><th>Area (km²)</th><td>{countryInfo.area?.toLocaleString()}</td></tr>
                            <tr><th>Currency</th><td>{countryInfo.currency_name} ({countryInfo.currency_code})</td></tr>
                            <tr><th>Language</th><td>{countryInfo.language}</td></tr>
                            <tr><th>Independent</th><td>{countryInfo.indipendent ? "Yes" : "No"}</td></tr>
                            <tr><th>Flag</th><td>{countryInfo.flag ? <img src={countryInfo.flag} alt="flag" style={{ width: "60px", border: "1px solid #ccc" }} /> : "No flag"}</td></tr>
                        </tbody>
                    </table>
                </div>
            )}


            {/* GDP TABLE */}
            {gdpData.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>GDP Table</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", border: "#f9f9f9" }}>
                        <thead>
                            <tr><th>Year</th><th>GDP Value</th><th>Growth (%)</th><th>Currency</th></tr>
                        </thead>
                        <tbody>
                            {displayedGdp.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.year}</td>
                                    <td>{row.gdp_value?.toLocaleString()}</td>
                                    <td>{row.growth_percent}</td>
                                    <td>{row.currency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                        <button onClick={() => setGdpPage(p => Math.max(1, p - 1))} disabled={gdpPage === 1}>← Prev</button>
                        <span style={{ margin: "0 1rem" }}>Page {gdpPage} of {totalGdpPages}</span>
                        <button onClick={() => setGdpPage(p => Math.min(totalGdpPages, p + 1))} disabled={gdpPage === totalGdpPages}>Next →</button>
                    </div>
                </div>
            )}



            {/* GDP CHART */}
            {gdpChartDataLimited.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>GDP Chart (Last 20 Years)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={gdpChartDataLimited}>
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => value.toLocaleString()} />
                            <Line type="monotone" dataKey="gdp" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* EXPORTS TABLE */}
            {countryInfo && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Export Data</h3>

                    {/* FILTERS */}
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label>Year: </label>
                            <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                                <option value="">All</option>
                                {Array.from(new Set(exportData.map(e => e.year))).sort((a, b) => b - a).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Export To: </label>
                            <input type="text" placeholder="Search country..." value={filters.exportTo} onChange={(e) => setFilters({ ...filters, exportTo: e.target.value })} style={{ padding: "0.25rem" }} />
                        </div>
                        <div>
                            <label>Product: </label>
                            <input type="text" placeholder="Search product..." value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })} style={{ padding: "0.25rem" }} />
                        </div>
                    </div>

                    {displayedExports.length > 0 ? (
                        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", border: "#f1f1f1" }}>
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort("year")} style={{ cursor: "pointer" }}>Year {sortConfig.key === "year" ? sortConfig.direction === "asc" ? "↑" : "↓" : ""}</th>
                                    <th onClick={() => requestSort("export_to")} style={{ cursor: "pointer" }}>Export To {sortConfig.key === "export_to" ? sortConfig.direction === "asc" ? "↑" : "↓" : ""}</th>
                                    <th onClick={() => requestSort("product")} style={{ cursor: "pointer" }}>Product {sortConfig.key === "product" ? sortConfig.direction === "asc" ? "↑" : "↓" : ""}</th>
                                    <th onClick={() => requestSort("export_value_usd_thousand")} style={{ cursor: "pointer" }}>Value (USD Thousand) {sortConfig.key === "export_value_usd_thousand" ? sortConfig.direction === "asc" ? "↑" : "↓" : ""}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedExports.map((ex, i) => (
                                    <tr key={i}>
                                        <td>{ex.year}</td>
                                        <td>{ex.export_to}</td>
                                        <td>{ex.product}</td>
                                        <td>{ex.export_value_usd_thousand?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No export data available for this country.</p>}

                    {/* EXPORT PAGINATION */}
                    {displayedExports.length > 0 && (
                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <button onClick={() => setExportPage(p => Math.max(1, p - 1))} disabled={exportPage === 1}>← Prev</button>
                            <span style={{ margin: "0 1rem" }}>Page {exportPage} of {totalExportPages}</span>
                            <button onClick={() => setExportPage(p => Math.min(totalExportPages, p + 1))} disabled={exportPage === totalExportPages}>Next →</button>
                        </div>
                    )}

                    {/* EXPORT CHARTS */}
                    {filteredForCharts.length > 0 && (
                        <div style={{ marginTop: "2rem" }}>
                            <h3>Export Charts</h3>
                            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                {/* PIE CHART 1: Top 5 Destination Countries */}
                                <div style={{ flex: "1 1 300px" }}>
                                    <h4>Top 5 Destination Countries</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={topCountriesData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                label={(entry) => entry.name}
                                            >
                                                {topCountriesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => value.toLocaleString()} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* PIE CHART 2: Top 5 Products */}
                                {topProductsData.length > 0 && (
                                    <div style={{ flex: "1 1 300px" }}>
                                        <h4>Top 5 Products</h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={topProductsData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#82ca9d"
                                                    label={(entry) => entry.name}
                                                >
                                                    {topProductsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => value.toLocaleString()} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
