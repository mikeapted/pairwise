import React, { Component } from 'react';
import {
  Button,
  Collapse,
  Container,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';
import parse from 'csv-parse/lib/es5/sync';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPair: [],
      currentPairIndex: [],
      headers: [],
      items: [],
      scores: [],
    };

    this.convertArrayOfObjectsToCSV = this.convertArrayOfObjectsToCSV.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.exportScores = this.exportScores.bind(this);
    this.getCsvValuesFromLine = this.getCsvValuesFromLine.bind(this);
    this.generatePair = this.generatePair.bind(this);
    this.hydrateStateWithLocalStorage = this.hydrateStateWithLocalStorage.bind(this);
    this.registerVote = this.registerVote.bind(this);
    this.reset = this.reset.bind(this);
    this.selectFile = this.selectFile.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.uploadItems = this.uploadItems.bind(this);
  }

  componentDidMount() {
    this.hydrateStateWithLocalStorage();
  }

  convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    //result += keys.join(columnDelimiter);
    //result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
  }

  downloadCSV() {  
    var data, filename, link;
    var csv = this.convertArrayOfObjectsToCSV({
        data: this.state.scores
    });
    console.log(csv);
    if (csv == null) return;

    filename = 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  exportScores() {
    this.downloadCSV();
  }

  getCsvValuesFromLine(line) {
    var values = line.split(',');
    values.map((value) => {
      return value.replace(/"/g, '');
    });
    return values;
  }

  generatePair() {
    //console.log('this.state.items', this.state.items);
    const itemOneIndex = Math.floor(Math.random() * this.state.items.length);
    const itemTwoIndex = Math.floor(Math.random() * this.state.items.length);
    let itemOne = this.state.items[itemOneIndex];
    let itemTwo = this.state.items[itemTwoIndex];
    console.log(itemOne, itemTwo);
    this.setState({
      currentPair: [itemOne, itemTwo],
      currentPairIndex: [itemOneIndex, itemTwoIndex]
    });
  }

  generatePairTable = (columnsToDisplay) => {
    let table = [];
    console.log('columnsToDisplay', columnsToDisplay);
    console.log('this.state', this.state);

    let currentPairServices = [[], []];
    for (let i=0; i<=1; i++) {
      for (let j=9; j<=14; j++) {
        if (this.state.currentPair[i] && this.state.currentPair[i][j] === 'TRUE') {
          currentPairServices[i].push(this.state.headers[j].replace('9. AWS Technologies used:', ''));
        }
      }
    }
    table.push(
      <tr>
        <td>{currentPairServices[0] ? currentPairServices[0] : ''}</td>
        <td>{currentPairServices[1] ? currentPairServices[1] : ''}</td>
      </tr>);
    columnsToDisplay.forEach(index => {
      table.push(
        <tr key={index}>
          <td>{this.state.currentPair[0] ? this.state.currentPair[0][index] : ''}</td>
          <td>{this.state.currentPair[1] ? this.state.currentPair[1][index] : ''}</td>
        </tr>)
    });

    console.log(table);
    return table
  }

  hydrateStateWithLocalStorage() {
    for (let key in this.state) {
      if (localStorage.hasOwnProperty(key)) {
        let value = localStorage.getItem(key);
        try {
          value = JSON.parse(value);
          this.setState({ [key]: value });
        } catch (e) {
          this.setState({ [key]: value });
        }
      }
    }

    setTimeout(() => {
      console.log(this.state.items.length);    
      if (this.state.items.length >= 1) {
        this.generatePair();
      }        
    }, 500);
  }

  registerVote = (winner) => {
    console.log('winner', winner);
    const loserBool = !winner;
    const loser = Number(loserBool);
    console.log('loser', loser);
    let scores = this.state.scores;
    scores.push([this.state.currentPairIndex[winner], this.state.currentPairIndex[loser]]);

    this.setState({
      scores
    });

    localStorage.setItem("scores", JSON.stringify(scores));

    this.generatePair();
  }

  reset() {
    if (window.confirm("Clear all items and scores?")) {
      this.setState({
        currentPair: [],
        currentPairIndex: [],
        headers: [],
        items: [],
        scores: [],
      });
  
      localStorage.setItem("items", JSON.stringify([]));
      localStorage.setItem("headers", JSON.stringify([]));
      localStorage.setItem("scores", JSON.stringify([]));
    } else {
      return;
    }
  }

  selectFile() {
    let fileInput = document.getElementById("csv");
    fileInput.click();
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  uploadItems(i) {
    let fileInput = document.getElementById("csv");
    let reader = new FileReader();
    reader.onload = () => {
      let items = parse(reader.result);
      let headers = items.shift();

      this.setState({
        items,
        headers
      });

      localStorage.setItem("items", JSON.stringify(items));
      localStorage.setItem("headers", JSON.stringify(headers));

      this.generatePair();
    };
    reader.readAsBinaryString(fileInput.files[0]);
  }

  render() {
    const columnsToDisplay = [7, 8, 23];

    return (
      <div className="App">
      <Container fluid={true}>
        <Navbar expand="md">
          <NavbarBrand href="/">pairwise</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="https://github.com/mikeapted/pairwise">GitHub</NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Options
                </DropdownToggle>
                <DropdownMenu right>
                  {this.state.items.length === 0 ? (
                    <DropdownItem onClick={this.selectFile}>
                      Open CSV
                    </DropdownItem>
                  ) : (
                    <div>
                      <DropdownItem onClick={this.exportScores}>
                        Export Scores
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={this.reset}>
                        Reset
                      </DropdownItem>
                    </div>
                  )}
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink href="#" onClick={this.toggleModal}>Help</NavLink>
              </NavItem>
              <Modal isOpen={this.state.modal} toggle={this.toggleModal} className={this.props.className}>
                <ModalHeader toggle={this.toggleModal}>Help</ModalHeader>
                <ModalBody>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" onClick={this.toggleModal}>Dismiss</Button>
                </ModalFooter>
              </Modal>
            </Nav>
          </Collapse>
        </Navbar>
        <div>
          {this.state.items.length === 0 ? (
            <div>
              <input id="csv" type="file"  onChange={this.uploadItems} />
              <p style={{ textAlign: 'center', padding: '20px' }}>
                Open a CSV file under Options to get started...
              </p>
            </div>
          ) : (
            <div>
              <div id="controlPanel">
                <div id="currentStats">
                  <p>
                    {this.state.items.length} items to rank<br />
                    {this.state.scores.length} pair(s) ranked<br />
                  </p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <td>
                      <Button color="primary" onClick={() => this.registerVote(0)}>
                        Vote for Pedro
                      </Button>
                    </td>
                    <td>
                      <Button color="primary" onClick={() => this.registerVote(1)}>
                        Vote for Not Pedro
                      </Button>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {this.generatePairTable(columnsToDisplay)}
                  </tbody>
              </table>
            </div>
          )}
        </div>
        </Container>
      </div>
    );
  }
}

export default App;
