NAME=$1

mkdir -p ./charts/stressoor/_tmp/src/
cp -R ../src/*.ts ./charts/stressoor/_tmp/src/
set -a; . .env; set +a; NAME=$NAME helmfile apply

rm -rf ./charts/stressoor/_tmp/src/

sleep 3
kubectl logs --follow --tail=-1 -l job-name=$NAME-stress-test-0-stressoor

sh ./cmd/log.sh $NAME
