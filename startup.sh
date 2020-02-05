#!/bin/bash
pm2 delete all
#exec fuser -n tcp -k 4200 && fuser -n tcp -k 4300

while fuser -n tcp -k 4200; do
    sleep 2
done

while fuser -n tcp -k 5000; do
    sleep 2
done

#echo "Starting Admin Portal Angular App ..................."
#cd /home/ubuntu/hub/work/DigitalCheckIn/AdminPortal
#exec  ng serve --port 4200 &
#sleep 2

#echo "Starting User Portal Angular App ..................."
#cd /home/ubuntu/hub/work/DigitalCheckIn/UserPortal
#exec ng serve --port 4400 &
#sleep 2

echo "Starting Admin Portal Angular App ..................."
pm2 start /home/ubuntu/hub/work/DigitalCheckIn/pm2Files/dev.yaml --only AdminPortal
sleep 2

echo "Starting Admin Portal Angular App ..................."
pm2 start /home/ubuntu/hub/work/DigitalCheckIn/pm2Files/dev.yaml --only UserPortal
sleep 2

echo "Starting backend Node.js App ..................."
pm2 start /home/ubuntu/hub/work/DigitalCheckIn/pm2Files/dev.yaml --only backend
sleep 2


exec pm2 log


echo "Starting mongodb service ......................."
exec sudo service mongod start
sleep 2

# chmod a+x startup.sh

# backend - 3000
# AdminPortal - 4200
# UserPortal - 5000