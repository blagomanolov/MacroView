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
import "./Dashboard.css";

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

    // Import state
    const [importData, setImportData] = useState([]);
    const [importPage, setImportPage] = useState(1);
    const importPerPage = 10;

    const [filters, setFilters] = useState({
        year: "",
        exportTo: "",
        product: "",
    });

    const [filtersI, setFiltersI] = useState({
        year: "",
        importTo: "",
        product: "",
    })

    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    // Dynamic line chart selections
    const [selectedExportTo, setSelectedExportTo] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");

    //Dynamic line chart selection
    const [selectedImportTo, setSelectedImportTo] = useState("");
    const [selectedProductI, setSelectedProductI] = useState("");

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
            setImportData([]);
            return;
        }

        setCountryInfo(null);
        setGdpData([]);
        setExportData([]);
        setImportData([]);
        setGdpPage(1);
        setExportPage(1);
        setFilters({ year: "", exportTo: "", product: "" });
        setFiltersI({ year: "", importTo: "", product: "" });
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

                const importRes = await fetch(`http://localhost:8000/imports/country/${countryJson.country_code}/?limit=1000000`);
                const importJson = importRes.ok ? await importRes.json() : [];
                setImportData(importJson);

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

    // Imports: filtering & sorting
    const filteredImport = importData
        .filter(ex =>
            (!filtersI.year || String(ex.year) === String(filtersI.year)) &&
            (!filtersI.importTo || ex.import_from?.toLowerCase().includes(filtersI.importTo.toLowerCase())) &&
            (!filtersI.product || ex.product?.toLowerCase().includes(filtersI.product.toLowerCase()))
        )
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aVal = a[sortConfig.key] ?? "";
            const bVal = b[sortConfig.key] ?? "";
            if (typeof aVal === "number" && typeof bVal === "number") return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
            return sortConfig.direction === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });

    const totalImportPages = Math.ceil(filteredImport.length / importPerPage);
    const displayedImport = filteredImport.slice((importPage - 1) * importPerPage, importPage * importPerPage);

    // Filtered imports for charts excluding 'All Products'
    const filteredForChartsI = filteredImport.filter(ex => ex.product !== "  All Products");

    // Top 5 Destination Countries
    const topCountriesDataI = Object.values(
        filteredForChartsI.reduce((acc, cur) => {
            if (!cur.import_from || !cur.import_value_usd_thousand) return acc;
            if (!acc[cur.import_from]) acc[cur.import_from] = { name: cur.import_from, value: 0 };
            acc[cur.import_from].value += cur.import_value_usd_thousand;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value).slice(0, 5);

    // Top 5 Products
    const topProductsDataI = Object.values(
        filteredForChartsI.reduce((acc, cur) => {
            if (!cur.product || !cur.import_value_usd_thousand) return acc;
            if (!acc[cur.product]) acc[cur.product] = { name: cur.product, value: 0 };
            acc[cur.product].value += cur.import_value_usd_thousand;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value).slice(0, 5);

    const requestSortI = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
    };

    // Dynamic options for line chart selects export
    const exportToOptions = Array.from(new Set(exportData.map(e => e.export_to).filter(Boolean))).sort();
    const productOptions = Array.from(new Set(exportData.map(e => e.product).filter(p => p && p !== "  All Products"))).sort();

    // Dynamic options for line chart selects import
    const importToOptions = Array.from(new Set(importData.map(e => e.import_from).filter(Boolean))).sort();
    const productOptionsI = Array.from(new Set(importData.map(e => e.product).filter(p => p && p !== "  All Products"))).sort();

    // Filtered data for line chart
    const exportLineChartData = selectedExportTo && selectedProduct
        ? exportData
            .filter(e => e.export_to === selectedExportTo && e.product === selectedProduct)
            .map(e => ({ year: Number(e.year), value: Number(e.export_value_usd_thousand) }))
            .sort((a, b) => a.year - b.year)
        : [];

    // Filtered data for line chart
    const importLineChartData = selectedImportTo && selectedProductI
        ? importData
            .filter(e => e.import_from === selectedImportTo && e.product === selectedProductI)
            .map(e => ({ year: Number(e.year), value: Number(e.import_value_usd_thousand) }))
            .sort((a, b) => a.year - b.year)
        : [];

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <button className="dashboard__back" onClick={onBack}>
                    ← Back
                </button>
                <h2 className="dashboard__title">Main Dashboard</h2>
            </div>

            <section className="card card--compact">
                <div className="form-row">
                    <label className="form-label" htmlFor="country">
                        Select Country
                    </label>
                    <select
                        id="country"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="select"
                    >
                        <option value="">-- Choose a country --</option>
                        {countries.map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {countryInfo && (
                <section className="card">
                    <h3 className="card__title">Country Information</h3>
                    <div className="table-wrapper">
                        <table className="data-table data-table--meta">
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
                                <tr>
                                    <th>Flag</th>
                                    <td>
                                        {countryInfo.flag ? (
                                            <img className="country-flag" src={countryInfo.flag} alt="flag" />
                                        ) : (
                                            "No flag"
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {gdpData.length > 0 && (
                <section className="card">
                    <div className="card__header">
                        <h3 className="card__title">GDP Table</h3>
                        <p className="card__subtitle">Showing {gdpPerPage} rows per page</p>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>GDP Value</th>
                                    <th>Growth (%)</th>
                                    <th>Currency</th>
                                </tr>
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
                    </div>
                    <div className="pagination">
                        <button className="btn" onClick={() => setGdpPage((p) => Math.max(1, p - 1))} disabled={gdpPage === 1}>
                            ← Prev
                        </button>
                        <span className="pagination__info">
                            Page {gdpPage} of {totalGdpPages}
                        </span>
                        <button className="btn" onClick={() => setGdpPage((p) => Math.min(totalGdpPages, p + 1))} disabled={gdpPage === totalGdpPages}>
                            Next →
                        </button>
                    </div>
                </section>
            )}

            {gdpChartDataLimited.length > 0 && (
                <section className="card card--chart">
                    <h3 className="card__title">GDP Chart (Last 20 Years)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={gdpChartDataLimited}>
                            <CartesianGrid stroke="#E5E7EB" strokeDasharray="8 6" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => value.toLocaleString()} />
                            <Line type="monotone" dataKey="gdp" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            )}

            {countryInfo && (
                <section className="card">
                    <div className="card__header">
                        <h3 className="card__title">Export Data</h3>
                        <p className="card__subtitle">Filter, explore and visualize export performance.</p>
                    </div>

                    <div className="filters">
                        <div className="form-control">
                            <label className="form-label">Year</label>
                            <select className="select" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                                <option value="">All</option>
                                {Array.from(new Set(exportData.map((e) => e.year)))
                                    .sort((a, b) => b - a)
                                    .map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="form-label">Export To</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Search country..."
                                value={filters.exportTo}
                                onChange={(e) => setFilters({ ...filters, exportTo: e.target.value })}
                            />
                        </div>
                        <div className="form-control">
                            <label className="form-label">Product</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Search product..."
                                value={filters.product}
                                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                            />
                        </div>
                    </div>

                    {displayedExports.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table data-table--interactive">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort("year")}>
                                            Year{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "year" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSort("export_to")}>
                                            Export To{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "export_to" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSort("product")}>
                                            Product{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "product" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSort("export_value_usd_thousand")}>
                                            Value (USD Thousand){" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "export_value_usd_thousand" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
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
                        </div>
                    ) : (
                        <p className="empty-state">No export data available for this country.</p>
                    )}

                    {displayedExports.length > 0 && (
                        <div className="pagination">
                            <button className="btn" onClick={() => setExportPage((p) => Math.max(1, p - 1))} disabled={exportPage === 1}>
                                ← Prev
                            </button>
                            <span className="pagination__info">
                                Page {exportPage} of {totalExportPages}
                            </span>
                            <button className="btn" onClick={() => setExportPage((p) => Math.min(totalExportPages, p + 1))} disabled={exportPage === totalExportPages}>
                                Next →
                            </button>
                        </div>
                    )}

                    {filteredForCharts.length > 0 && (
                        <div className="card-grid">
                            <div className="card card--chart">
                                <h4 className="card__title">Top 5 Destination Countries</h4>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={topCountriesData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            fill="#6366F1"
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

                            {topProductsData.length > 0 && (
                                <div className="card card--chart">
                                    <h4 className="card__title">Top 5 Products</h4>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={topProductsData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                fill="#10B981"
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
                    )}

                    {exportData.length > 0 && (
                        <div className="card card--chart">
                            <div className="card__header">
                                <h3 className="card__title">Custom Export Line Chart</h3>
                                <p className="card__subtitle">Compare export performance for a specific partner and product.</p>
                            </div>

                            <div className="filters filters--inline">
                                <div className="form-control">
                                    <label className="form-label">Export To</label>
                                    <select className="select" value={selectedExportTo} onChange={(e) => setSelectedExportTo(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {exportToOptions.map((c, i) => (
                                            <option key={i} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="form-label">Product</label>
                                    <select className="select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {productOptions.map((p, i) => (
                                            <option key={i} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {exportLineChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={exportLineChartData}>
                                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="8 6" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => value.toLocaleString()} />
                                        <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                selectedExportTo &&
                                selectedProduct && <p className="empty-state">No data for selected Export To and Product combination.</p>
                            )}
                        </div>
                    )}
                </section>
            )}

            {countryInfo && (
                <section className="card">
                    <div className="card__header">
                        <h3 className="card__title">Import Data</h3>
                        <p className="card__subtitle">Understand inbound trade partners and products.</p>
                    </div>

                    <div className="filters">
                        <div className="form-control">
                            <label className="form-label">Year</label>
                            <select className="select" value={filtersI.year} onChange={(e) => setFiltersI({ ...filtersI, year: e.target.value })}>
                                <option value="">All</option>
                                {Array.from(new Set(importData.map((e) => e.year)))
                                    .sort((a, b) => b - a)
                                    .map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="form-label">Import From</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Search country..."
                                value={filtersI.importTo}
                                onChange={(e) => setFiltersI({ ...filtersI, importTo: e.target.value })}
                            />
                        </div>
                        <div className="form-control">
                            <label className="form-label">Product</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Search product..."
                                value={filtersI.product}
                                onChange={(e) => setFiltersI({ ...filtersI, product: e.target.value })}
                            />
                        </div>
                    </div>

                    {displayedImport.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table data-table--interactive">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSortI("year")}>
                                            Year{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "year" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSortI("import_from")}>
                                            Import From{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "import_from" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSortI("product")}>
                                            Product{" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "product" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                        <th onClick={() => requestSortI("import_value_usd_thousand")}>
                                            Value (USD Thousand){" "}
                                            <span className="sort-indicator">
                                                {sortConfig.key === "import_value_usd_thousand" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedImport.map((ex, i) => (
                                        <tr key={i}>
                                            <td>{ex.year}</td>
                                            <td>{ex.import_from}</td>
                                            <td>{ex.product}</td>
                                            <td>{ex.import_value_usd_thousand?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="empty-state">No import data available for this country.</p>
                    )}

                    {displayedImport.length > 0 && (
                        <div className="pagination">
                            <button className="btn" onClick={() => setImportPage((p) => Math.max(1, p - 1))} disabled={importPage === 1}>
                                ← Prev
                            </button>
                            <span className="pagination__info">
                                Page {importPage} of {totalImportPages}
                            </span>
                            <button className="btn" onClick={() => setImportPage((p) => Math.min(totalImportPages, p + 1))} disabled={importPage === totalImportPages}>
                                Next →
                            </button>
                        </div>
                    )}

                    {filteredForChartsI.length > 0 && (
                        <div className="card-grid">
                            <div className="card card--chart">
                                <h4 className="card__title">Top 5 Countries</h4>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={topCountriesDataI}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            fill="#6366F1"
                                            label={(entry) => entry.name}
                                        >
                                            {topCountriesDataI.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => value.toLocaleString()} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {topProductsDataI.length > 0 && (
                                <div className="card card--chart">
                                    <h4 className="card__title">Top 5 Products</h4>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={topProductsDataI}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                fill="#10B981"
                                                label={(entry) => entry.name}
                                            >
                                                {topProductsDataI.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => value.toLocaleString()} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}

                    {importData.length > 0 && (
                        <div className="card card--chart">
                            <div className="card__header">
                                <h3 className="card__title">Custom Import Line Chart</h3>
                                <p className="card__subtitle">Track products sourced from a specific partner over time.</p>
                            </div>

                            <div className="filters filters--inline">
                                <div className="form-control">
                                    <label className="form-label">Import From</label>
                                    <select className="select" value={selectedImportTo} onChange={(e) => setSelectedImportTo(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {importToOptions.map((c, i) => (
                                            <option key={i} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="form-label">Product</label>
                                    <select className="select" value={selectedProductI} onChange={(e) => setSelectedProductI(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {productOptionsI.map((p, i) => (
                                            <option key={i} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {importLineChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={importLineChartData}>
                                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="8 6" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => value.toLocaleString()} />
                                        <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                selectedImportTo &&
                                selectedProductI && <p className="empty-state">No data for selected Import To and Product combination.</p>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
