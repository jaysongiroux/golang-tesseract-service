export const CURL_CODE = `$ curl https://api.${process.env.NEXT_PUBLIC_DOMAIN_NAME}/services/ocr -X POST -F file=@invoice.pdf -H 'Content-Type: multipart/form-data' -H 'x-api-key: YOUR_KEY'`;

export const JS_CODE = `
const formData = new FormData();
formData.append("file", new File([], "invoice.pdf"));

const response = await fetch(
  "https://api.${process.env.NEXT_PUBLIC_DOMAIN_NAME}/services/ocr",
  {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "YOUR_KEY",
    },
    body: formData,
  }
);

const data = await response.json();
console.log(data);`;
