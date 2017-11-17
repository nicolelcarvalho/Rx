import React from 'react';
import { Jumbotron } from 'react-bootstrap'
import "./Jumbotron.css";
import { Image } from "react-bootstrap"
import { Row, Col, Button } from "react-bootstrap"



class Jumbotrons extends React.Component {
  render() {
    return (
    <div>
    <Image className="main-image" src={require("../../assets/checking_message.jpg")}></Image>
    <p id="text">RxMinder is designed to give you peace of mind while your loved one maintains their independence. Schedule medication reminders for others and be at ease knowing that they are following their regimen.
    <br/><a href="#learn-more"><Button className="btn-lg learn-btn">Learn More</Button></a></p>
      <Row id="learn-more" className="row rowGrid">
         <Col className="column icon-info icon-info-left" xs={3} md={3}>
          <h3 className="icon-title">Easy Scheduling</h3>
          <Image height="100" width="100" alt="icon" src={require("../../assets/hospital.png")} />
          <h4 className="caption">Create scheduled reminders for your loved one.</h4>
        </Col>
        <Col className="column icon-info" xs={3} md={3}>
          <h3 className="icon-title">Text Notifications</h3>
          <Image height="100" width="100" alt="icon" src={require("../../assets/technology-1.png")} />
          <h4 className="caption">Your loved one will then receive a text reminder for the scheduled time.</h4>
        </Col>
        <Col className="column icon-info" xs={3} md={3}>
          <h3 className="icon-title">Text Alerts</h3>
          <Image height="100" width="100" alt="icon" src={require("../../assets/technology.png")} />
          <h4 className="caption">You'll receive a text if a reminder has been missed.</h4>
        </Col>
        <Col className="column icon-info" xs={3} md={3}>
          <h3 className="icon-title">Be at Ease</h3>
          <Image height="100" width="100" alt="icon" src={require("../../assets/heart.png")} />
          <h4 className="caption">Follow their daily schedule from your own device to see which reminders have been completed.</h4>
        </Col>
        
        
      </Row>

  	</div>
		);
	}
}

export default Jumbotrons;