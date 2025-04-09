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
    libpng-dev


COPY go.mod go.sum ./
RUN go get github.com/otiai10/gosseract/v2
RUN go mod download

CMD ["air", "-c", ".air.toml"]