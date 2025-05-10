# === Builder Stage ===
FROM golang:latest AS builder

# Install required development libraries for Tesseract and Leptonica (so headers are available during build)
RUN apt update \
    && apt install -y \
    libtesseract-dev \
    libleptonica-dev\
    tesseract-ocr \
    tesseract-ocr-eng \
    libpng-dev

WORKDIR /app

# Copy dependency files and download modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire code base
COPY . ./

# Build the Go application with CGO enabled (so it links against Tesseract’s C libraries)
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o app .

# === Production Stage ===
FROM debian:12-slim

COPY --from=builder /app/app /usr/local/bin/app

COPY --from=builder /app/requirements.txt /usr/local/bin/requirements.txt

COPY --from=builder /app/scripts /usr/local/bin/scripts

RUN apt update \
    && apt install -y \
    libtesseract-dev \
    libleptonica-dev\
    tesseract-ocr \
    tesseract-ocr-eng \
    libpng-dev \ 
    python3 \
    python3-pip \
    python3-dev

RUN pip3 install --no-cache-dir --break-system-packages -r /usr/local/bin/requirements.txt

# download the easyocr models
RUN python3 /usr/local/bin/scripts/easy.py load

EXPOSE 8001

CMD ["/usr/local/bin/app"]
