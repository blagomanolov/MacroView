import pandas as pd
import pycountry
import sys
import os
from sqlalchemy import text
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import engine

def get_country_code(country_name):
    try:
        return pycountry.countries.get(name=country_name).alpha_2
    except:
        return {
            'Turkey': 'TR', 'Tanzania': 'TZ', 'Vietnam': 'VN', "Cote d'Ivoire": 'CI',
            'Czech Republic': 'CZ', 'Egypt, Arab Rep.': 'EG', 'Bolivia': 'BO', 'Brunei': 'BN',
            'Congo, Rep.': 'CD', 'Ethiopia(excludes Eritrea)': 'ET', 'Hong Kong, China': 'HK',
            'Iran, Islamic Rep.': 'IR', 'Kyrgyz Republic': 'KG', 'Korea, Rep.': 'KR',
            'Moldova': 'MD', 'Serbia, FR(Serbia/Montenegro)': 'RS', 'Slovak Republic': 'SK'
        }.get(country_name, None)


download_dir = "/downloads-export"
file_paths = [
    os.path.join(download_dir, f) 
    for f in os.listdir(download_dir) 
    if f.endswith(".xlsx")
]

dfs = []
for file_to_extract in file_paths:
    try:
        df = pd.read_excel(file_to_extract, sheet_name='Partner')
        df = df.rename(columns={
            "Reporter Name": "country",
            "Partner Name": "export_to",
            "Year": "year",
            "Product Group": "product",
            "Export (US$ Thousand)": "export_value_usd_thousand"
        })

        df['country_code'] = df['country'].apply(get_country_code)
        df['export_country_code'] = df['export_to'].apply(get_country_code)

        df_to_insert = df[['country_code', 'country', 'export_to', 'export_country_code', 'year', 'product', 'export_value_usd_thousand']]
        dfs.append(df_to_insert)

        print(f"Data from {os.path.basename(file_to_extract)} processed!")
    except Exception as e:
        print(f"!!! Problem reading {file_to_extract}: {e}")
        continue

df_all = pd.concat(dfs, ignore_index=True)

df_all['id'] = (
    df_all.groupby('country_code')
          .cumcount()
          .add(1)
)
df_all['id'] = df_all['country_code'] + df_all['id'].astype(str)
df_all = df_all.set_index('id')

df_all.to_sql('exports', engine, if_exists='append', index=True, index_label='id')
print(f"All data inserted with custom country_code-based index!")
