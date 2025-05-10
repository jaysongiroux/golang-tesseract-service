FROM golang:latest

WORKDIR /app

RUN go install github.com/air-verse/air@latest

# install tesseract
RUN apt update \
    && apt install -y \
    libtesseract-dev \
    libleptonica-dev\
    tesseract-ocr \
    tesseract-ocr-eng \
    libpng-dev \
    python3 \
    python3-pip \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0

# Install Python dependencies
COPY requirements.txt /usr/local/bin/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /usr/local/bin/requirements.txt

COPY go.mod go.sum ./
RUN go get github.com/otiai10/gosseract/v2
RUN go mod download

# download the easyocr models
COPY scripts/ /usr/local/bin/
RUN python3 /usr/local/bin/easy.py load

CMD ["air", "-c", ".air.toml"]
