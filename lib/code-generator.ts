"use client"

interface CodeGeneratorParams {
  url: string
  method: string
  technology: string
  authMethod: string
  token: string
  username: string
  password: string
  apiKeyName: string
  apiKeyValue: string
  customHeaderName: string
  customHeaderValue: string
  useVariables?: boolean
}

export function generateCode(params: CodeGeneratorParams): string {
  const {
    url,
    method,
    technology,
    authMethod,
    token,
    username,
    password,
    apiKeyName,
    apiKeyValue,
    customHeaderName,
    customHeaderValue,
    useVariables = false,
  } = params

  // Generate headers based on auth method
  let headers = {}

  if (authMethod === "bearer" && token) {
    headers = { ...headers, Authorization: `Bearer ${token}` }
  } else if (authMethod === "basic" && username && password) {
    const base64Credentials = btoa(`${username}:${password}`)
    headers = { ...headers, Authorization: `Basic ${base64Credentials}` }
  } else if (authMethod === "apiKey" && apiKeyName && apiKeyValue) {
    headers = { ...headers, [apiKeyName]: apiKeyValue }
  } else if (authMethod === "custom" && customHeaderName && customHeaderValue) {
    headers = { ...headers, [customHeaderName]: customHeaderValue }
  }

  // Generate code based on selected technology
  switch (technology) {
    case "fetch":
      return generateFetchCode(url, method, headers, useVariables)
    case "axios":
      return generateAxiosCode(url, method, headers, useVariables)
    case "xhr":
      return generateXhrCode(url, method, headers, useVariables)
    case "jquery":
      return generateJQueryCode(url, method, headers, useVariables)
    case "reactQuery":
      return generateReactQueryCode(url, method, headers, useVariables)
    default:
      return generateFetchCode(url, method, headers, useVariables)
  }
}

function formatValue(value: string, useVariables: boolean): string {
  if (!useVariables) return `"${value}"`

  // Check if the value contains spaces or special characters
  if (/[\s\W]/.test(value)) {
    // For complex values, use template literals with variables
    return `\`${value.replace(/([^a-zA-Z0-9_\s])/g, "\\$1")}\``
  }

  // For simple values, use ${variableName}
  return `\${${value}}`
}

function formatHeaders(headers: Record<string, string>, useVariables: boolean): string {
  if (Object.keys(headers).length === 0) return "{}"

  if (!useVariables) {
    return JSON.stringify(headers, null, 2)
  }

  // Format headers with variables
  const formattedHeaders = Object.entries(headers)
    .map(([key, value]) => {
      // Extract the actual value from "Bearer token" or similar
      const actualValue = value.includes(" ") ? value.split(" ")[1] : value

      if (value.startsWith("Bearer ")) {
        return `    "${key}": \`Bearer \${${actualValue}}\``
      } else if (value.startsWith("Basic ")) {
        return `    "${key}": \`Basic \${${actualValue}}\``
      } else {
        return `    "${key}": \${${actualValue}}`
      }
    })
    .join(",\n")

  return `{\n${formattedHeaders}\n  }`
}

function generateFetchCode(
  url: string,
  method: string,
  headers: Record<string, string>,
  useVariables: boolean,
): string {
  const hasHeaders = Object.keys(headers).length > 0
  const formattedUrl = useVariables ? `\${apiUrl}` : `"${url}"`
  const headersString = formatHeaders(headers, useVariables)

  return `// Using Fetch API
${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${hasHeaders && useVariables ? generateVariableDeclarations(headers) : ""}
const fetchData = async () => {
  try {
    const response = await fetch(${formattedUrl}, {
      method: "${method}",${
        hasHeaders
          ? `
      headers: ${headersString},`
          : ""
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Call the function
fetchData();`
}

function generateAxiosCode(
  url: string,
  method: string,
  headers: Record<string, string>,
  useVariables: boolean,
): string {
  const hasHeaders = Object.keys(headers).length > 0
  const formattedUrl = useVariables ? `\${apiUrl}` : `"${url}"`
  const headersString = formatHeaders(headers, useVariables)

  return `// Using Axios
import axios from 'axios';

${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${hasHeaders && useVariables ? generateVariableDeclarations(headers) : ""}
const fetchData = async () => {
  try {
    const response = await axios({
      method: "${method.toLowerCase()}",
      url: ${formattedUrl},${
        hasHeaders
          ? `
      headers: ${headersString},`
          : ""
      }
    });
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Call the function
fetchData();`
}

function generateXhrCode(url: string, method: string, headers: Record<string, string>, useVariables: boolean): string {
  const headersEntries = Object.entries(headers)
  const formattedUrl = useVariables ? `\${apiUrl}` : `"${url}"`

  let headersCode = ""

  if (useVariables) {
    headersCode = headersEntries
      .map(([key, value]) => {
        // Extract the actual value from "Bearer token" or similar
        const actualValue = value.includes(" ") ? value.split(" ")[1] : value

        if (value.startsWith("Bearer ")) {
          return `xhr.setRequestHeader("${key}", \`Bearer \${${actualValue}}\`);`
        } else if (value.startsWith("Basic ")) {
          return `xhr.setRequestHeader("${key}", \`Basic \${${actualValue}}\`);`
        } else {
          return `xhr.setRequestHeader("${key}", ${actualValue});`
        }
      })
      .join("\n  ")
  } else {
    headersCode = headersEntries.map(([key, value]) => `xhr.setRequestHeader("${key}", "${value}");`).join("\n  ")
  }

  return `// Using XMLHttpRequest
${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${headersEntries.length > 0 && useVariables ? generateVariableDeclarations(headers) : ""}
const xhr = new XMLHttpRequest();
xhr.open("${method}", ${formattedUrl}, true);

// Set request headers${
    headersEntries.length > 0
      ? `
  ${headersCode}`
      : ""
  }

xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  } else {
    console.error("Request failed with status:", xhr.status);
  }
};

xhr.onerror = function() {
  console.error("Request failed");
};

xhr.send();`
}

function generateJQueryCode(
  url: string,
  method: string,
  headers: Record<string, string>,
  useVariables: boolean,
): string {
  const hasHeaders = Object.keys(headers).length > 0
  const formattedUrl = useVariables ? `\${apiUrl}` : `"${url}"`
  const headersString = formatHeaders(headers, useVariables)

  return `// Using jQuery
${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${hasHeaders && useVariables ? generateVariableDeclarations(headers) : ""}
$.ajax({
  url: ${formattedUrl},
  type: "${method}",${
    hasHeaders
      ? `
  headers: ${headersString},`
      : ""
  }
  success: function(data) {
    console.log(data);
  },
  error: function(xhr, status, error) {
    console.error("Request failed:", error);
  }
});`
}

function generateReactQueryCode(
  url: string,
  method: string,
  headers: Record<string, string>,
  useVariables: boolean,
): string {
  const hasHeaders = Object.keys(headers).length > 0
  const formattedUrl = useVariables ? `\${apiUrl}` : `"${url}"`
  const headersString = formatHeaders(headers, useVariables)
  const isGet = method === "GET"

  if (isGet) {
    return `// Using React Query for GET request
import { useQuery } from '@tanstack/react-query';
${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${hasHeaders && useVariables ? generateVariableDeclarations(headers) : ""}
// Define the fetch function
const fetchData = async () => {
  const response = await fetch(${formattedUrl}, {
    method: "${method}",${
      hasHeaders
        ? `
    headers: ${headersString},`
        : ""
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! Status: \${response.status}\`);
  }
  
  return response.json();
};

// React component using the query
function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Data Loaded</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default MyComponent;`
  } else {
    return `// Using React Query for ${method} request
import { useMutation } from '@tanstack/react-query';
${useVariables ? 'const apiUrl = "' + url + '";\n' : ""}${hasHeaders && useVariables ? generateVariableDeclarations(headers) : ""}
// Define the mutation function
const submitData = async (payload) => {
  const response = await fetch(${formattedUrl}, {
    method: "${method}",${
      hasHeaders
        ? `
    headers: ${headersString},`
        : ""
    }
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! Status: \${response.status}\`);
  }
  
  return response.json();
};

// React component using the mutation
function MyComponent() {
  const mutation = useMutation({
    mutationFn: submitData,
    onSuccess: (data) => {
      console.log('Success:', data);
      // Handle success (e.g., show notification, update UI)
    },
    onError: (error) => {
      console.error('Error:', error);
      // Handle error (e.g., show error message)
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Example payload - replace with your actual data
    const payload = {
      name: 'Example',
      value: 'Data',
    };
    mutation.mutate(payload);
  };

  return (
    <div>
      <button 
        onClick={handleSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Data'}
      </button>
      
      {mutation.isSuccess && <div>Success! Data submitted.</div>}
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </div>
  );
}

export default MyComponent;`
  }
}

function generateVariableDeclarations(headers: Record<string, string>): string {
  const declarations = []

  for (const [key, value] of Object.entries(headers)) {
    if (value.startsWith("Bearer ")) {
      declarations.push(`const ${value.split(" ")[1]} = "your-token-here";`)
    } else if (value.startsWith("Basic ")) {
      declarations.push(`const ${value.split(" ")[1]} = "base64-encoded-credentials";`)
    } else {
      declarations.push(`const ${value} = "your-value-here";`)
    }
  }

  return declarations.join("\n") + "\n"
}
