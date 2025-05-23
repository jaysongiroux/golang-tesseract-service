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
    python3-pip \
    python3 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    # cleanup
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists

RUN pip3 install --break-system-packages -r /usr/local/bin/requirements.txt


RUN python3 /usr/local/bin/scripts/easyocr_ocr.py load

RUN python3 /usr/local/bin/scripts/doctr_ocr.py load

RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists

EXPOSE 8001

CMD ["/usr/local/bin/app"]

