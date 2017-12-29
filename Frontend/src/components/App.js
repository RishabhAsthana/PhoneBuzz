/*  
 *  File: App.js
 *  Contains frontend implementation
 *  @author: Rishabh Asthana {asthana4@illinois.edu}
 */
import React, { Component } from 'react';
import { Container, Segment, Header, Button, Input, Icon, Table } from 'semantic-ui-react'
import axios from 'axios';

// Local storage variables
let number = '';
let delay = 0;
let self = '';
let api_url = 'Insert Backend URL here';

class App extends Component {
    
  constructor(){
      super();
      this.state = {logs : []};
      this.handleNumber.bind(this);
      this.handleNumber.bind(this);
      this.handleSubmit.bind(this);
      this.handleReplay.bind(this);
      this.fetchData.bind(this);
  }
  componentDidMount(){
      self = this;
      this.fetchData();
  }
  // This function keeps track of phone number field input
  handleNumber(data){
      number = data.target.value;
  }
  // This function keeps track of delay field input
  handleDelay(data){
      delay = parseInt(data.target.value, 10);
  }
  // This function handles the call to the backend when user intends to dial a number    
  handleSubmit(){
    console.log('Number entered : ' + number);
    console.log('Delay entered : ' + delay);
    axios.post(api_url + '/call', {
        number: number,
        delay: delay
        }).then(function(response){
            console.log('Request successful');
        }).catch(function(err){
            console.log('Error occured : ' + err);
        });
  }
  // This function handles the call to the backend when user intends to replay a call   
  handleReplay(number, digits){
      axios.post(api_url + '/replayCall', {
        number: number,
        digits: digits
        }).then(function(response){
            console.log('Request successful');
        }).catch(function(err){
            console.log('Error occured : ' + err);
        });
  }
    
  // This function fetches the logs from the database and stores them into the state       
  fetchData(){
      axios.get(window.encodeURI(api_url + '/logs'))
          .then(function(response){
              self.setState({logs:response.data.data});
          });
  }
    
  render() {
    const logs = this.state.logs.map( (item, i) => {
        return(
            <Table.Row key={i}>
                <Table.Cell>
                    {item.phone_number}
                </Table.Cell>
                <Table.Cell>
                    {item.dateCreated}
                </Table.Cell>
                <Table.Cell>
                    {item.delay}
                </Table.Cell>
                <Table.Cell>
                    {item.number}
                </Table.Cell>
                <Table.Cell>
                    <Button icon positive onClick={() => {this.handleReplay(item.phone_number,item.number)}}>
                        <Icon name='phone' />
                    </Button>
                </Table.Cell>
            </Table.Row>
        );
    });
    return (
    <Container>
          <Segment.Group>
          <Segment textAlign='center'>
            <Header as='h1'>Phone Buzz</Header>
          </Segment>
          <Segment raised>
            <Header as='h2'>Call a number</Header>
          </Segment>
          <Segment raised textAlign='center'>
            <Input size='large'
                   onChange={(data) =>{this.handleNumber(data)}}
                   placeholder='+1217123XXXX'  
                   label='Number'
            />      
            <Input size='large' 
                   action={<Button icon primary onClick={this.handleSubmit}>
                           <Icon name='phone' />
                           </Button>}
                   onChange={(data) =>{this.handleDelay(data)}}
                   placeholder='5000'
                   label='Delay(ms)'
                />
          </Segment>
          <Segment>
            <Header as='h2'>Call History</Header>
          </Segment>
          <Segment>
            <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Phone number</Table.HeaderCell>
                    <Table.HeaderCell>Time of Call</Table.HeaderCell>
                    <Table.HeaderCell>Delay</Table.HeaderCell>
                    <Table.HeaderCell>Number</Table.HeaderCell>
                    <Table.HeaderCell>Replay</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                {logs}
                </Table.Body>
            </Table>    
          </Segment>
          </Segment.Group>
    </Container>
    );
  }
}

export default App;
