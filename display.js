
console.log("Display Running...");

function roll(q) {
    return Math.atan2(2 * (
        q[0] * q[1] +
        q[2] * q[3]
        ), 1 - 2 * (
        q[1] * q[1] +
        q[2] * q[2]
    )) * 57.3;
}

function pitch(q) {
    return Math.asin(2 * (
        q[0] * q[2] -
        q[3] * q[1]
    )) * 57.3;
}

function yaw(q) {
    return Math.atan2(2 * (
        q[0] * q[3] +
        q[1] * q[2]
        ), 1 - 2 * (
        q[2] * q[2] +
        q[3] * q[3]
        )) * 57.3;
}

function deltaT(messages) {
    let deltas = [];
    for (let i = 1; i < messages.length; i++) {
        deltas.push(messages[i].timestamp - messages[i - 1].timestamp);
    }
    return deltas;
}

// input is a list of lists of coords
function graph(data, title) {
    // let colors = ["red", "blue", "green", "orange", "purple"];
    let graphs = [];
    for (let i = 0; i < data.length; i++) {
        graphs.push({
            x: data[i].x,
            y: data[i].y,
            type: "markers",
            name: data[i].name,
        });
    }
    let layout = {
        title: title,
        xaxis: {
    		title: {
      		text: 'time (min)'
      		}
      	}
    };
    layout = title ? layout : null;
    let graphDiv = document.createElement("div");
    graphDiv.id = "graph-" + title;
    document.getElementById("graphs").appendChild(graphDiv);

    Plotly.newPlot('graph-' + title, graphs, layout);
}

function graph_xy(data, title) {
    // let colors = ["red", "blue", "green", "orange", "purple"];
    let graphs = [];
    for (let i = 0; i < data.length; i++) {
        graphs.push({
            x: data[i].x,
            y: data[i].y,
            type: "markers",
            name: data[i].name,
        });
    }
    let layout = {
        title: title,
        xaxis: {
    		title: {
      			text: 'East (m)'
      		}
      	}, 
		yaxis: {
			scaleanchor: 'x',
			title: {
      			text: 'North (m)'
      		}
		}
    };
    layout = title ? layout : null;
    let graphDiv = document.createElement("div");
    graphDiv.id = "graph-" + title;
    document.getElementById("graphs").appendChild(graphDiv);

    Plotly.newPlot('graph-' + title, graphs, layout);
}

function displayULogBinary(binary) {
    readULog(binary, (d) => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("display").style.display = "block";
        console.log(d);

        for (key in d.info) {
            let row = document.createElement("tr");
            let keyDom = document.createElement("td");
            let valDom = document.createElement("td");
            keyDom.innerText = key;
            valDom.innerText = d.info[key];
            row.appendChild(keyDom);
            row.appendChild(valDom);
            document.getElementById("infoTable").appendChild(row);
        }

        for (key in d.multiInfo) {
            let row = document.createElement("tr");
            let keyDom = document.createElement("td");
            let valDom = document.createElement("td");
            keyDom.innerText = key;
            valDom.innerText = d.multiInfo[key].join(" ");
            row.appendChild(keyDom);
            row.appendChild(valDom);
            document.getElementById("multiInfoTable").appendChild(row);
        }

        for (let i = 0; i < d.logs.length; i++) {
            let row = document.createElement("tr");
            let timeDom = document.createElement("td");
            let levelDom = document.createElement("td");
            let messageDom = document.createElement("td");
            timeDom.innerText = d.logs[i].timestamp;
            levelDom.innerText = d.logs[i].log_level;
            messageDom.innerText = d.logs[i].message;
            row.appendChild(timeDom);
            row.appendChild(levelDom);
            row.appendChild(messageDom);
            document.getElementById("logTable").appendChild(row);
        }

        document.getElementById("numDropouts").innerText = d.dropouts.length.toString();
        document.getElementById("dropoutTime").innerText = (d.dropouts.reduce((a, b) => a + b, 0) / 1000).toString();

        graph_xy([
            {
                x: _.map(d.data.vehicle_local_position_0, (x) => {return x.y}),
                y: _.map(d.data.vehicle_local_position_0, (x) => {return x.x}),
                name: "2D position"
            }
            // ,
            // {
            //     x: _.map(d.data.vehicle_local_position_setpoint_0, (x) => {return x.y}),
            //     y: _.map(d.data.vehicle_local_position_setpoint_0, (x) => {return x.x}),
            //     name: "2D position ref."
            // }              
        ], "Top View Pos. (m)");

        let divider=60e6; // time displayed as min

        graph([
            // {
            //     x: _.map(d.data.sensor_baro_0, (x) => {return x.timestamp/divider}),
            //     y: _.map(d.data.sensor_baro_0, (x) => {return x.altitude}),
            //     name: "Barometer Altitude"
            // },
            // {
            //     x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
            //     y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.alt / 1000}),
            //     name: "GPS Altitude"
            // },
            {
                x: _.map(d.data.vehicle_local_position_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_local_position_0, (x) => {return -x.z}),
                name: "Altitude Local"
            },
            {
                x: _.map(d.data.vehicle_local_position_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_local_position_setpoint_0, (x) => {return -x.z}),
                name: "Altitude Ref."
            },
            {
                x: _.map(d.data.distance_sensor_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.distance_sensor_0, (x) => {return x.current_distance}),
                name: "Distance Sensor"
            },
            {
                x: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return (x.thrust_body[0]-x.thrust_body[2])*10}),
                name: "Throttle [0,10]"
            },
            {
                x: _.map(d.data.vehicle_status_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_status_0, (x) => {return x.nav_state}),
                name: "Nav. 0=man, 1=alt, 2=pos"
            }    
        ], "Altitude (m)");

        graph([
            {
                x: _.map(d.data.manual_control_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.manual_control_setpoint_0, (x) => {return x.y}),
                name: "y - roll"
            },
            {
                x: _.map(d.data.manual_control_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.manual_control_setpoint_0, (x) => {return x.x}),
                name: "x - pitch"
            },
            {
                x: _.map(d.data.manual_control_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.manual_control_setpoint_0, (x) => {return x.r}),
                name: "r - yaw"
            },
            {
                x: _.map(d.data.manual_control_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.manual_control_setpoint_0, (x) => {return x.z}),
                name: "z - throttle "
            }
        ], "RC Inputs (-1,1)");

        graph([
            {
                x: _.map(d.data.actuator_controls_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_controls_0, (x) => {return x.control[0]}),
                name: "roll"
            },
            {
                x: _.map(d.data.actuator_controls_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_controls_0, (x) => {return x.control[1]}),
                name: "pitch"
            },
            {
                x: _.map(d.data.actuator_controls_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_controls_0, (x) => {return x.control[2]}),
                name: "yaw"
            },
            {
                x: _.map(d.data.actuator_controls_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_controls_0, (x) => {return x.control[3]}),
                name: "throttle"
            }
        ], "Actuator Controls (-1,1)");   

        graph([
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[0]}),
                name: "out 1"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[1]}),
                name: "out 2"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[2]}),
                name: "out 3"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[3]}),
                name: "out 4"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[4]}),
                name: "out 5"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[5]}),
                name: "out 6"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[6]}),
                name: "out 7"
            },
            {
                x: _.map(d.data.actuator_outputs_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.actuator_outputs_0, (x) => {return x.output[7]}),
                name: "out 8"
            }
        ], "Actuator Outputs (-1,1)");  

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return roll(x.q)}),
                name: "roll"
            },
            {
                x: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return roll(x.q_d)}),
                name: "roll ref."
            }
        ], "Roll Angle (deg)");

        graph([
            {
                x: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.xyz[0]*57.3}),
                name: "roll rate"
            },
            {
                x: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.roll*57.3}),
                name: "roll rate ref."
            },
            {
                x: _.map(d.data.rate_ctrl_status_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.rate_ctrl_status_0, (x) => {return x.rollspeed_integ*10}),
                name: "roll rate int. (*10)"
            }
        ], "Roll Angular Rate (deg/s)");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return pitch(x.q)}),
                name: "pitch"
            },
            {
                x: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return pitch(x.q_d)}),
                name: "pitch ref"
            }
        ], "Pitch Angle (deg)");

        graph([
            {
                x: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.xyz[1]*57.3}),
                name: "pitch rate"
            },
            {
                x: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.pitch*57.3}),
                name: "pitch rate ref."
            },
            {
                x: _.map(d.data.rate_ctrl_status_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.rate_ctrl_status_0, (x) => {return x.pitchspeed_integ*10}),
                name: "pitch rate int. (*10)"
            }
        ], "Pitch Angular Rate (deg/s)");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return yaw(x.q)}),
                name: "yaw"
            },
            {
                x: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_attitude_setpoint_0, (x) => {return yaw(x.q_d)}),
                name: "yaw ref"
            }
        ], "Yaw Angle (deg)");

        graph([
            {
                x: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_angular_velocity_0, (x) => {return x.xyz[2]*57.3}),
                name: "yaw rate"
            },
            {
                x: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_rates_setpoint_0, (x) => {return x.yaw*57.3}),
                name: "yaw rate ref."
            },
            {
                x: _.map(d.data.rate_ctrl_status_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.rate_ctrl_status_0, (x) => {return x.yawspeed_integ*10}),
                name: "yaw rate int. (*10)"
            }
        ], "Yaw Angular Rate (deg/s)");

        graph([
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.x}),
                name: "x"
            },
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.y}),
                name: "y"
            },
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.z}),
                name: "z"
            }
        ], "Acceleration (m/s^2)");

        graph([
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.x*57.3}),
                name: "x"
            },
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.y*57.3}),
                name: "y"
            },
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.z*57.3}),
                name: "z"
            }
        ], "Gyroscope (deg/s)");

        graph([
            {
                x: _.map(d.data.sensor_mag_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_mag_0, (x) => {return x.x}),
                name: "x"
            },
            {
                x: _.map(d.data.sensor_mag_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_mag_0, (x) => {return x.y}),
                name: "y"
            },
            {
                x: _.map(d.data.sensor_mag_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.sensor_mag_0, (x) => {return x.z}),
                name: "z"
            }
        ], "Mag Sensor (Gauss)");

        graph([
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.satellites_used}),
                name: "Num Satellites Used"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.fix_type}),
                name: "GPS Fix"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.hdop}),
                name: "Horizontal Position Accuracy (m)"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.vdop}),
                name: "Vertical Position Accuracy (m)"
            }
        ], "GPS Uncertainty");

        // graph([
        //     {
        //         x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
        //         y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.noise_per_ms}),
        //         name: "Noise per ms"
        //     },
        //     {
        //         x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp/divider}),
        //         y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.jamming_indicator}),
        //         name: "Jamming"
        //     }
        // ], "GPS Noise & Jamming");

        // graph([
        //     {
        //         x: _.map(d.data.estimator_status_0, (x) => {return x.timestamp/divider}),
        //         y: _.map(d.data.estimator_status_0, (x) => {return x.nan_flags}),
        //         name: "Noise per ms"
        //     },
        // ], "Estimator Watchdog");

        // graph([
        //     {
        //         x: _.map(d.data.vehicle_status_0, (x) => {return x.timestamp/divider}),
        //         y: _.map(d.data.vehicle_status_0, (x) => {return x.rc_signal_lost ? 1 : 0}),
        //         name: "RC Lost (Detected)"
        //     },
        // ], "RC Quality");

        // graph([
        //     {
        //         x: _.map(d.data.sensor_combined_0, (x) => {return x.timestamp/divider}),
        //         y: deltaT(d.data.sensor_combined_0),
        //         name: "delta t (between 2 logged samples)"
        //     },
        //     {
        //         x: _.map(d.data.estimator_status_0, (x) => {return x.timestamp/divider}),
        //         y: _.map(d.data.estimator_status_0, (x) => {return x.time_slip}),
        //         name: "Estimator Time Slip"
        //     }
        // ], "Sampling Regularity of Sensor Data");
    });
}

function handleFileSelect(evt) {
    document.getElementById("loading").style.display = "block";
    let files = evt.target.files;

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();

        reader.onload = (e) => {displayULogBinary(e.target.result)};

        reader.readAsArrayBuffer(files[i]);
    }
}
document.getElementById('files').addEventListener('change', handleFileSelect, false);
