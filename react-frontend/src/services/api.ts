
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USE_API = true;

// Done
export const apiService = {
  async getSheets(): Promise<{ id: string; sheet: any }[]> {
    console.log('Getting sheets');
    if (USE_API) {
      const response = await fetch('http://localhost:8000/load-sheets');
      const data = await response.json();
      console.log('Sheets:', data);
      return data.sheets || [];
    }

    await delay(1000); // Simulating API delay
    return [
      {
        id: '1',
        sheet: {
          id: '1',
          title: 'Sample Sheet',
          description: 'A sample research spreadsheet',
          indexColumn: 'company_name',
          columns: ['company_name', 'industry', 'location'],
          data: [['Company 1', 'Tech', 'SF'], ['Company 2', 'Health', 'NY']],
          sources: [['Source 1', 'Source 2', 'Source 3'], ['Source 4', 'Source 5', 'Source 6']]
        }
      }
    ];
  },

  // Done
  async getSuggestedColumns(description: string): Promise<string[]> {
    console.log('Getting suggested columns:', description);
    if (USE_API) {
      const response = await fetch('http://localhost:8000/suggested-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: description
        })
      });
      const data = await response.json();
      console.log('Suggested columns:', data);
      return data.results;
    }

    await delay(1000); // Simulating API delay
    return [
      'company_name',
      'industry',
      'location',
      'founding_year',
      'employee_count',
      'website',
      'funding_stage',
      'founders',
      'description'
    ];
  },

  // Done
  async autofillIndexColumn(params: {
    description: string;
    col_name: string;
    max_count: number;
  }): Promise<string[]> {
    console.log('Autofilling index column:', params);
    if (USE_API) {
      const response = await fetch(`http://localhost:8000/autofill-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const data = await response.json();
      console.log('Autofilled index column:', data);
      return data.results;
    }
    await delay(1000);
    return Array(params.max_count)
      .fill(0)
      .map((_, i) => `Company ${i + 1}`);
  },

  // Done
  async autofillCells(params: {
    description: string;
    columns: string[];
    index_value: string;
  }): Promise<{ values: string[]; sources: string[] }> {
    console.log('Autofilling cells:', params);
    if (USE_API) {
      const response = await fetch('http://localhost:8000/autofill-cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const result = await response.json();
      return result;
    }
    await delay(1000);
    return {
      values: params.columns.map((column_name) => `Generated value for ${params.index_value} + ${column_name}`),
      sources: params.columns.map((column_name) => `Source for ${params.index_value} + ${column_name}`)
    };
  },

  // Done
  async saveSpreadsheet(data: { id: string; sheet: any }): Promise<void> {
    console.log('Saving spreadsheet:', data.id);
    // Remove the sheet.columnWidths from the data if it exists
    if (data.sheet.columnWidths) {
      delete data.sheet.columnWidths;
    }
    if (USE_API) {
      await fetch(`http://localhost:8000/save-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      console.log('Saved spreadsheet:', data);
    }
    await delay(500);
    console.log('Saving spreadsheet:', data);
  }
};
