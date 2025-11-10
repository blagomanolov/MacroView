import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import ReactTooltip from "react-tooltip";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const WorldMap = () => {
  const [tooltipContent, setTooltipContent] = useState("");

  return (
    <div>
      <ComposableMap data-tip="" projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => {
                  setTooltipContent(`${geo.properties.NAME}`);
                }}
                onMouseLeave={() => {
                  setTooltipContent("");
                }}
                style={{
                  default: {
                    fill: "#D6D6DA",
                    outline: "none",
                  },
                  hover: {
                    fill: "#F53",
                    outline: "none",
                  },
                  pressed: {
                    fill: "#E42",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      <ReactTooltip>{tooltipContent}</ReactTooltip>
    </div>
  );
};

export default WorldMap;
