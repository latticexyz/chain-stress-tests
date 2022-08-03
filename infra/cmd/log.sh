NAME=$1
FILE_PATH=./logs/$NAME.$(date +%s).log

mkdir -p ./logs

kubectl logs --tail=500 -l job-name=$NAME-stress-test-0-stressoor > $FILE_PATH

LOGS=$(<$FILE_PATH)
tmp=${LOGS#*"[outputstart]"}
OUTPUT=${tmp%"[outputend]"*}

printf '%s\n' "$OUTPUT" > $FILE_PATH.json

echo "Logs > $FILE_PATH"
