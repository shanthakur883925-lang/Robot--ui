#!/bin/bash

setTarget="$1"
robotNumber="$2"
bagName="$3"
downloadPath="$4"
bagCount="$5"

echo "Running flag: $setTarget for robot number: $robotNumber"

# ===== ARGUMENT COUNT VALIDATION BASED ON FLAG =====
if [[ "$setTarget" == "-D" ]]; then
    # Download command requires 5 inputs
    if [[ $# -ne 5 ]]; then
        echo "❌ Usage for Download:"
        echo "$0 -D <robotNumber> <bagName> <downloadPath> <bagCount>"
        exit 1
    fi
else
    # All other commands require only 2 inputs
    if [[ $# -ne 2 ]]; then
        echo "❌ Usage:"
        echo "$0 <flag> <robotNumber>"
        exit 1
    fi
fi

# Robot number must always be numeric
if ! [[ "$robotNumber" =~ ^[0-9]+$ ]]; then
    echo "❌ Robot number must be numeric."
    exit 1
fi


robotType="zippy"
password="zippy"
IPPrefix="10.30.72."
LanIP="193.193.193.2"
offsetIP=60
serverRegistryIP="10.10.0.105"
serverRegistryPort="5000"

# File paths
paramFilePath=./robot_files/robot_parameters
envFilePath=./robot_files/env.csv
dockerSetupFilePath=./robot_files/docker_setup
startupFilePath=./robot_files/startup.sh
firmwarePath=./robot_files/DHL_HOST_CLI
saviourPath=./robot_files/saviour
paramjsonfilePath=./robot_files/params.json
zipPath=./robot_files/zip
ospath=./robot_files/zippy_os.yaml

print_help() {
    echo "Help Manual:"
    echo "-s : SSH into robot"
    echo "-i : Inspect docker image on robot"
    echo "-v : Updating syncmover firmware"
    echo "-o : Linear odom"
    echo "-h : Hostname change"
    echo "-p : Update robot parameters"
    echo "-L : Retrieve latest limited roslogger bags"
    echo "-M : Check bags list"
    echo "-T : Check pgv offset value"
    echo "-d : debug_detail"
    echo "-c : client_debug"
    echo "-m : topic_monitor" 
    echo "-B : barcode data "
    echo "-E : error codes "
    echo "-A : lifter debug "
    echo "-G : goal result "
    echo "-O : raw odom"
    echo "-D : Download robot Bag files"
    echo "-N: Teleop Robot"
    echo "-c21 : CONVEYOR BACKWARD MODE"
    echo "-c22 : CONVEYOR FORWARD MODE"
}

case "$1" in
    "") 
        echo "=== Please provide atleast one argument for example $0 -s ==="
        print_help
        exit 1
        ;;
    -s|-i|-x|-u|-v|-o|-h|-p|-X|-L|-M|-T|-d|-c|-m|-B|-E|-A|-G|-O|-D|-N|-c21|-c22)
        setTarget="$1"
        ;;
    *)
        echo "Error: Invalid option '$1'"
        print_help
        exit 1
        ;;
esac

if [[ $# -gt 2 || ($# -eq 2 && $2 =~ ^[0-9]+$) ]]; then
    robotNumbers=()
    stringArgs=()

    for arg in "${@:2}"; do
        if [[ "$arg" =~ ^[0-9]+$ ]]; then
            robotNumbers+=("$arg")
        else
            stringArgs+=("$arg")
        fi
    done

    if [[ ${#stringArgs[@]} -eq 0 ]]; then
        :
    elif [[ ${#stringArgs[@]} -eq 1 ]]; then
        rosbag="${stringArgs[0]}"
    else
        echo "Invalid usage: Too many non-numeric arguments."
        exit 1
    fi

elif [[ $# -le 2 ]]; then

    if [[ $# -eq 2 ]]; then
        if [[ ! $2 =~ ^[0-9]+$ ]]; then
            rosbag="$2"
        else
            echo "❌ Invalid usage: Second argument should be a non-numeric string (e.g., rosbag name)."
            exit 1
        fi
    fi

    echo "Do you want to enter:"
    echo "1. Random robot numbers"
    echo "2. Series of robot numbers"
    read -p "Choose 1 or 2: " choice

    if [[ "$choice" == "1" ]]; then
        read -p "Enter robot numbers (space separated): " -a robotNumbers
    elif [[ "$choice" == "2" ]]; then
        read -p "Enter start number: " start
        read -p "Enter end number: " end
        for ((i=start; i<=end; i++)); do
            robotNumbers+=("$i")
        done
    else
        echo "❌ Invalid choice. Exiting."
        exit 1
    fi
else
    echo "❌ Invalid usage."
    exit 1
fi


for id in "${robotNumbers[@]}"; do
    ((IP = id + offsetIP))
    robotIP="${IPPrefix}${IP}"
    robotpassword="${password}"
    Hostname="${robotType}${id}"
    registry_entry="${serverRegistryIP}:${serverRegistryPort}"
    echo
    echo "=== Working for Robot ID: ${id} with IP: ${robotIP} ==="
    if ! ping -c 1 -W 2 "$robotIP" &> /dev/null; then
        echo "ERROR ❌ : Robot IP $robotIP is not reachable. Skipping robot ID: ${id}"
        continue 1
    fi

    ssh-keygen -f "$HOME/.ssh/known_hosts" -R "$robotIP" &>/dev/null


#SSH into robot using (-s)
    if [[ "$setTarget" == "-s" ]]; then
        echo "Connecting via SSH..."
        sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP"

#Inspect docker image on robot using (-i)
    elif [[ "$setTarget" == "-i" ]]; then
    echo "Inspecting Docker image..."
    sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP" \ "echo $robotpassword | sudo -S docker inspect ${robotType} | grep 'Image' | awk 'NR==1'"

#Restart Docker using (-x)
    elif [[ "$setTarget" == "-x" ]]; then
        echo "Restarting robot docker..."
        sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP" \ "echo $robotpassword | sudo -S /opt/docker_setup/startup.sh"

#Update Docker Registry Configuration using (-u)
    elif [[ $setTarget = "-u" ]]; then
            command1="echo "testpassword" | sudo -S docker login ${serverRegistryIP}:${serverRegistryPort} --username testuser --password-stdin"
            command2='cd /opt/docker_setup && echo '${robotpassword}' | sudo -S ./setup_robot.sh'
            # echo "sshpass -p ${robotpassword} scp -r ${dockerSetupFilePath} "${robotType}@$robotIP":/home/zippy/"
            # sshpass -p ${robotpassword} scp -r ${dockerSetupFilePath} "${robotType}@$robotIP":/home/zippy/
            echo "${command2}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command2}
            # echo "${command1}"
            # sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command1}

#Update syncmover firmware using (-v)
elif [[ $setTarget = "v" ]]; then
            command1="echo ${robotpassword} | sudo -S docker rm -f $(docker ps -q)"
            command3='cd ~/DHL_HOST_CLI && echo ${robotpassword} | sudo -S chmod +x ./host_cli && echo ${robotpassword} | sudo -S ./host_cli -v && echo ${robotpassword} | sudo -S ./host_cli -o dual-motor-driver20.bin && echo ${robotpassword} | sudo -S ./host_cli -v'
            #command3='cd ~/DHL_HOST_CLI && echo ${robotpassword} | sudo -S chmod +x ./host_cli && echo ${robotpassword} | sudo -S ./host_cli -v'
            command4="echo ${robotpassword} | sudo -S /opt/docker_setup/startup.sh"
            echo "${command1}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command1}
            echo "${command2}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command2}
            echo "sshpass -p '${robotpassword}' scp -r '${firmwarepath}' '${robotType}@${robotIP}:~'"
	        sshpass -p '${robotpassword}' scp -r '${firmwarepath}' '${robotType}@${robotIP}:~'
            echo "${command3}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command3}
            echo "firmware updated"
            echo "${command4}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no "${robotType}@$robotIP" ${command4}

#Linear odom using (-o)
    elif [[ "$setTarget" == "-o" ]]; then
        commandA="source /home/zippy/zippy_ws/install/setup.bash"
        commandB="echo LINEAR SPEED"
        commandC="rostopic echo /odom/twist/twist/linear/x "
	dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC}'"
	sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no ${robotType}@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

	elif [[ "$setTarget" == "-h" ]]; then
        echo "Updating Hostname to $Hostname"
	sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@${robotIP}" "echo $robotpassword | sudo -S hostnamectl set-hostname ${Hostname}"

#Retrieve roslogger bags after reindexing using (-R)
    elif [[ $setTarget = "-R" ]]; then
    folder_name="bags"
    if [ ! -d "$folder_name" ]; then
        mkdir "$folder_name"
        echo "Folder '$folder_name' created."
    else
        echo "Folder '$folder_name' already exists. Skipping creation."
    fi
    if [ -z "$rosbag" ]; then
        arg2="${folder_name}_Bot${id}"
    else
        arg2="$rosbag"
    fi
    echo "$arg2"
    commandA="source /home/zippy/zippy_ws/install/setup.bash && cp -r /home/zippy/logs/bags  /home/zippy/logs/$arg2 && rosbag reindex  /home/zippy/logs/$arg2/*.active && rm -rf  /home/zippy/logs/$arg2/*.orig*"
    commandB="sudo -S docker exec zippy bash -c '${commandA}'"
    command1="cd  /home/zippy/logs/ && echo ${robotpassword} | sudo -S zip -r -p $arg2 $arg2"
    command2="scp -r -p -o StrictHostKeyChecking=no ${robotType}@${robotIP}:/home/zippy/logs/$arg2.zip ./bags"
    command3="cd  /home/zippy/logs/ && echo ${robotpassword} | sudo -S rm -rf $arg2.zip $arg2"
    echo "${commandB}"
    echo
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no ${robotType}@${robotIP} "echo ${robotpassword} | ${commandB}"
    echo "${command1}"
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command1}"
    echo "${command2}"
    sshpass -p ${robotpassword} ${command2}
    cd bags || exit
    unzip $arg2.zip
    robot_folder="$id"
    folder_name1="$(date +%F_%H-%M-%S)"
    mkdir -p "${robot_folder}/${folder_name1}"
    mv $arg2 "${robot_folder}/${folder_name1}"
    rm -rf ./$arg2.zip
    cd "${robot_folder}/${folder_name1}/${arg2}"
    echo "Current directory is: $(pwd)"
    for file in *.bag.active; do
      if [[ -e "$file" ]]; then
        mv -- "$file" "${file%.active}"
      fi
    done
    echo "${command3}"
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command3}"


#Retrieve roslogger bags using (-r)
    elif [[ $setTarget = "-r" ]]; then
    folder_name="bags"
    if [ ! -d "$folder_name" ]; then
        mkdir "$folder_name"
        echo "Folder '$folder_name' created."
    else
        echo "Folder '$folder_name' already exists. Skipping creation."
    fi
    if [ -z "$rosbag" ]; then
        arg2="$folder_name"
    else
        arg2="$rosbag"
    fi
    command1="cd ~/logs/ && echo ${robotpassword} | sudo -S tar -czvf $arg2.tar bags"
    command2="scp -r -p -o StrictHostKeyChecking=no ${robotType}@${robotIP}:/home/zippy/logs/$arg2.tar ./bags"
    command3="cd ~/logs/ && echo ${robotpassword} | sudo -S rm -rf $arg2.tar"
    echo "${command1}"
    echo
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command1}"
    echo
    echo "${command2}"
    sshpass -p ${robotpassword} ${command2}
    cd bags || exit
    robot_folder="$id"
    folder_name1="$(date +%F_%H-%M-%S)"
    mkdir -p "${robot_folder}/${folder_name1}"
    mv $arg2.tar "${robot_folder}/${folder_name1}"
    rm -rf ./$arg2.tar
    cd ..
    echo "${command3}"
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command3}"

#Retrieve roslogger bags using (-p)
    elif [[ $setTarget = "-p" ]]; then
            command1="cd /home/zippy/cfg/ && echo ${robotpassword} | sudo -S rm -f zippy_os.yaml"
            #command2="echo ${robotpassword} | sudo -S rm -rf /opt/docker_setup && echo ${robotpassword} | sudo -S mv /home/zippy/docker_setup /opt/" #&& echo ${robotpassword} | sudo -S /opt/docker_setup/startup.sh"
            #command2="echo ${robotpassword} | sudo -S /opt/docker_setup/startup.sh"
            echo "${command1}"
            sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no ${robotType}@${robotIP} ${command1}
            echo "sshpass -p ${robotpassword} scp -r ${ospath}  ${robotType}@${robotIP}:/home/zippy/cfg/"
	    sshpass -p ${robotpassword} scp -r ${osPath} ${robotType}@${robotIP}:/home/zippy/cfg/.
            # echo "sshpass -p ${robotpassword} scp -r ${paramFilePath} ${dockerSetupFilePath} ${robotType}@${robotIP}:/home/zippy/"
	        # sshpass -p ${robotpassword} scp -r ${paramFilePath}  ${dockerSetupFilePath} ${robotType}@${robotIP}:/home/zippy/
            #echo "${command2}"
            #sshpass -p ${robotpassword} ssh -oStrictHostKeyChecking=no ${robotType}@${robotIP} ${command2}
            #echo

    elif [[ "$setTarget" == "-U" ]]; then 
            command1="echo ${robotpassword} | sudo -S docker rm -f zippy"
            command2="echo ${robotpassword} | sudo -S rm -rf robot_parameters.zip && echo ${robotpassword} | sudo -S mv robot_parameters robot_parameters_oldmain"
            command3="echo ${robotpassword} | sudo -S rm -rf robot_parameters/robot.yaml"
            command4="echo ${robotpassword} | sudo -S mv robot_parameters_oldmain/robot.yaml robot_parameters/ && echo ${robotpassword} | sudo -S rm -rf robot_parameters_oldmain"
            command5="cd /opt/docker_setup/ && echo ${robotpassword} | sudo -S ./startup.sh"
            echo "${command1}"
            sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no zippy@${robotIP} ${command1}
            echo "${command2}"
            sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no zippy@${robotIP} ${command2}
            echo "sshpass -p ${robotpassword} scp -r ${paramFilePath} zippy@${robotIP}:/home/zippy/"
	    sshpass -p ${robotpassword} scp -r ${paramFilePath} zippy@${robotIP}:/home/zippy/
            echo "${command3}"
            sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no zippy@${robotIP} ${command3}
            echo "${command4}"
            sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no zippy@${robotIP} ${command4}
            echo "${command5}"
            sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no zippy@${robotIP} ${command5}

    #Reboot robot using (-X)
    elif [[ "$setTarget" == "-X" ]]; then
        echo "Rebooting robot.."
        sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP" \ "echo $robotpassword | sudo -S docker pull 10.10.0.105:5000/zippyx:latest"

    #Retrieve Latest limited roslogger bags using (-L)
    elif [[ $setTarget = "-L" ]]; then
    folder_name="bags"
    if [ ! -d "$folder_name" ]; then
        mkdir "$folder_name"
        echo "Folder '$folder_name' created."
    else
        echo "Folder '$folder_name' already exists. Skipping creation."
    fi
    if [ -z "$rosbag" ]; then
        arg2="$folder_name"
    else
        arg2="$rosbag"
    fi
    command1="cd ~/logs/ && latest_files=\$(ls -tp bags | grep -v / | head -2 | tr '\n' ' ') && echo ${robotpassword} | sudo -S tar -czvf $arg2.tar -C bags \$latest_files && du -bh $arg2.tar"
    command2="scp -r -p -o StrictHostKeyChecking=no ${robotType}@${robotIP}:/home/zippy/logs/$arg2.tar ./bags"
    command3="cd ~/logs/ && echo ${robotpassword} | sudo -S rm -rf $arg2.tar"
    echo "${command1}"
    echo
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command1}"
    echo
    echo "${command2}"
    sshpass -p ${robotpassword} ${command2}
    cd bags || exit
    robot_folder="$id"
    folder_name1="$(date +%F_%H-%M-%S)"
    mkdir -p "${robot_folder}/${folder_name1}"
    mv $arg2.tar "${robot_folder}/${folder_name1}"
    rm -rf ./$arg2.tar
    cd ..
    echo "${command3}"
    sshpass -p ${robotpassword} ssh -o StrictHostKeyChecking=no ${robotType}@${robotIP} "${command3}"

elif [[ "$setTarget" == "-M" ]]; then
    command1="cd ~/logs/bags/ && ls -ltrh"
    echo "Inspecting Docker image..."
sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP" "${command1}"

elif [[ "$setTarget" == "-T" ]]; then
    command1="cd ~/cfg/robot_parameters && cat robot.yaml"
    echo "Inspecting pgv offset..."
sshpass -p "$robotpassword" ssh -o StrictHostKeyChecking=no "${robotType}@$robotIP" "${command1}"

# -d debug_detail
    elif [[ $setTarget = "-d" ]]; then
        commandA="source /home/zippy/zippy_ws/install/setup.bash"
        commandB="echo ''"
        commandC="echo DEBUG_DETAIL"
        commandD="rostopic echo /debug_detail"
        commandE="exit"
        dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
        sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -c client_debug
    elif [[ $setTarget = "-c" ]]; then
        commandA="source /home/zippy/zippy_ws/install/setup.bash"
        commandB="echo ''"
        commandC="echo CLIENT_DEBUG"
        commandD="rostopic echo /client_debug"
        commandE="exit"
        dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
        sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    #  -m topic_monitor
    elif [[ $setTarget = "-m" ]]; then
        commandA="source /home/zippy/zippy_ws/install/setup.bash"
        commandB="echo ''"
        commandC="echo TOPIC MONITOR"
        commandD="rostopic echo /topic_monitor/monitoring"
        commandE="exit"
        dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
        sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -B barcode data 
    elif [[ $setTarget = "-B" ]]; then
    commandA="source /home/zippy/zippy_ws/install/setup.bash"
    commandB="echo ''"
    commandC="echo BARCODE DATA"
    commandD="rostopic echo /barcode_pose_raw"
    commandE="exit"
    dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -E Error Codes
    elif [[ $setTarget = "-E" ]]; then
    commandA="source /home/zippy/zippy_ws/install/setup.bash"
    commandB="echo ''"
    commandC="echo ERROR CODES"
    commandD="rostopic echo /error_code"
    commandE="exit"
    dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -A Lifter Debug 
    elif [[ $setTarget = "-A" ]]; then
    commandA="source /home/zippy/zippy_ws/install/setup.bash"
    commandB="echo ''"
    commandC="echo LIFTER DEBUG"
    commandD="rostopic echo /lift_debug"
    commandE="exit"
    dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -g  Goal Result 
    elif [[ $setTarget = "-G" ]]; then
    commandA="source /home/zippy/zippy_ws/install/setup.bash"
    commandB="echo ''"
    commandC="echo GOAL RESULT"
    commandD="rostopic echo /goal_result"
    commandE="exit"
    dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -O raw odom 
    elif [[ $setTarget = "-O" ]]; then
    commandA="source /home/zippy/zippy_ws/install/setup.bash"
    commandB="echo ''"
    commandC="echo RAW ODOM"
    commandD="rostopic echo /raw_odom"
    commandE="exit"
    dockerCommand="sudo -S docker exec zippy bash -c '${commandA} && ${commandB} && ${commandC} && ${commandD} && ${commandE}'"
    sshpass -p ${robotpassword} ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} "echo ${robotpassword} | ${dockerCommand}"

    # -N Teleop Robot 
    elif [[ $setTarget = "-N" ]]; then
    robotNumber=$2
    robotIP=${robotIP}  # assume this is set earlier
    echo "=== Teleop Robot ID: $robotNumber | IP: $robotIP ==="
    echo "⚡ Starting manual teleop. Robot will NOT move until you press keys (F/B/L/R/S)."
    echo "⚠ You must enter the sudo password manually when prompted to enable interactive teleop."
    ssh -t -o StrictHostKeyChecking=no zippy@${robotIP} \
    "sudo docker exec -it zippy bash -c 'source /home/zippy/zippy_ws/install/setup.bash && echo Manual Teleop Started && rosrun turtlebot3_teleop turtlebot3_teleop_key'"
    echo "⚡ Manual teleop session ended."


   # -c21 CONVEYOR BACKWARD MODE
   elif [[ $setTarget = "-c21" ]]; then

    robotNumber=$2
    robotIP=${robotIP}

    echo "=== Conveyor BACK Command | Robot ID: $robotNumber | IP: $robotIP ==="
    echo "⚡ Starting conveyor BACK (data: 21)"

    sshpass -p "${robotpassword}" ssh -tt -o StrictHostKeyChecking=no zippy@${robotIP} \
    "echo ${robotpassword} | sudo -S docker exec zippy bash -c '
        source /home/zippy/zippy_ws/install/setup.bash &&
        echo \"▶ Conveyor BACK running...\" &&
        rostopic pub -1 /conveyor_control std_msgs/Int16 \"data: 21\" &&
        sleep 10 &&
        echo \"⏹ Stopping conveyor (data: 0)\" &&
        rostopic pub -1 /conveyor_control std_msgs/Int16 \"data: 0\" &&
        exit
    '; exit"

    echo "✅ Conveyor cycle complete. Script exiting."


    # -c22 CONVEYOR FORWARD MODE 
    elif [[ $setTarget = "-c22" ]]; then

    robotNumber=$2
    robotIP=${robotIP}

    echo "=== Conveyor FORWARD Command | Robot ID: $robotNumber | IP: $robotIP ==="
    echo "⚡ Starting conveyor FORWARD (data: 22)"

    sshpass -p "${robotpassword}" ssh -tt -o StrictHostKeyChecking=no zippy@${robotIP} \
    "echo ${robotpassword} | sudo -S docker exec zippy bash -c '
        source /home/zippy/zippy_ws/install/setup.bash &&
        echo \"▶ Conveyor FORWARD running...\" &&
        rostopic pub -1 /conveyor_control std_msgs/Int16 \"data: 22\" &&
        sleep 10 &&
        echo \"⏹ Stopping conveyor (data: 0)\" &&
        rostopic pub -1 /conveyor_control std_msgs/Int16 \"data: 0\" &&
        exit
    '; exit"

    echo "✅ Conveyor cycle complete. Script exiting."
    
    fi
done


