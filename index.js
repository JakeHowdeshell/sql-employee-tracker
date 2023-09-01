const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "employees_db",
});
function promptQuestions() {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
      ],
      loop: true,
      name: "intro",
    })
    .then(function (data) {
      if (data.intro == "View all departments") {
        db.query(`SELECT * FROM department`, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.table(result);
          promptQuestions();
        });
      } else if (data.intro == "View all roles") {
        db.query(
          `SELECT role.id AS id, title, salary, name FROM role JOIN department ON role.department_id = department.id`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            // const transformed = result.reduce((dep, {id, ...x}) => {dep[id] = x; return dep}, {})
            console.table(result);
            promptQuestions();
          }
        );
      } else if (data.intro == "View all employees") {
        //   db.query();
        promptQuestions();
      } else if (data.intro == "Add a department") {
        inquirer
          .prompt({
            type: "input",
            message: "What is the name of the department?",
            name: "newDep",
          })
          .then(function (depName) {
            console.log(depName.newDep);
            // db.query();
          });
        promptQuestions();
      } else if (data.intro == "Add a role") {
        inquirer
          .prompt([
            {
              type: "input",
              message: "What is the name of the role?",
              name: "newRole",
            },
            {
              type: "input",
              message: "What is the salary of the role?",
              name: "roleSal",
            },
            {
              type: "list",
              message: "Which department does your role belong to?",
              // need to figure out how to automaticlly update choices
              choices: [],
              name: "roleDep",
            },
          ])
          .then(function (role) {
            console.log(role.newRole);
            console.log(role.roleSal);
            console.log(role.roleDep);
            //db.query()
            promptQuestions();
          });
      } else if (data.intro == "Add an employee") {
        inquirer
          .prompt([
            {
              type: "input",
              message: "What is the employee's first name?",
              name: "firstName",
            },
            {
              type: "input",
              message: "What is the employee's last name?",
              name: "lastName",
            },
            {
              type: "list",
              message: "What is the employee's role?",
              // need to figure out how to automaticlly update choices
              choices: [],
              name: "role",
            },
            {
              type: "list",
              message: "Who is the employee's manager?",
              // need to figure out how to automaticlly update choices
              choices: [],
              name: "manager",
            },
          ])
          .then(function (employee) {
            console.log(employee);
            //db.query()
          });
      } else if (data.intro == "Update an employee role") {
        inquirer
          .prompt([
            {
              type: "list",
              message: "Which employee's role do you want to update?",
              // need to figure out how to automaticlly update choices
              choices: [],
              name: "employee",
            },
            {
              type: "list",
              message:
                "Which role do you want to assign the selected employee?",
              // need to figure out how to automaticlly update choices
              choices: [],
              name: "role",
            },
          ])
          .then(function (data) {
            console.log(data);
            //db.query()
          });
      }
    });
}
promptQuestions();
