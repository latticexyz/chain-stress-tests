FROM sandrokeil/typescript

WORKDIR /app
ADD ./ ./

ARG COMMIT=""
ARG VERSION=""

LABEL commit="$COMMIT" version="$VERSION"
