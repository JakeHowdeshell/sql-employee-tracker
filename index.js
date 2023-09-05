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
          `SELECT role.id AS id, title, salary, department.name AS department FROM role JOIN department ON role.department_id = department.id`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.table(result);
            promptQuestions();
          }
        );
      } else if (data.intro == "View all employees") {
        db.query(
          `SELECT 
          employee.id AS id, 
          employee.first_name AS first_name, 
          employee.last_name AS last_name, 
          role.title AS title,
          department.name AS department,
          role.salary AS salary,
          CONCAT(manager.first_name,' ',manager.last_name) AS manager
          FROM employee 
          JOIN role 
          ON employee.role_id = role.id 
          JOIN department 
          ON role.department_id = department.id
          LEFT JOIN employee manager
          ON employee.manager_id = manager.id`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.table(result);
            promptQuestions();
          }
        );
      } else if (data.intro == "Add a department") {
        inquirer
          .prompt({
            type: "input",
            message: "What is the name of the department?",
            name: "newDep",
          })
          .then(function (depName) {
            const newDep = depName.newDep;
            db.query(
              `INSERT INTO department (name) VALUES ('${newDep}')`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                console.log(`Added ${newDep} to the database.`);
                promptQuestions();
              }
            );
          });
      } else if (data.intro == "Add a role") {
        db.query(`SELECT * FROM department`, (err, result) => {
          if (err) {
            console.log(err);
          }
          const departmentChoices = result.map((department) => ({
            name: department.name,
            value: department.id,
          }));
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
                choices: departmentChoices,
                name: "roleDep",
              },
            ])
            .then(function (role) {
              const title = role.newRole;
              const salary = role.roleSal;
              const departmentId = role.roleDep;
              db.query(
                `INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', '${departmentId}')`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(`Added ${title} to the database.`);
                  promptQuestions();
                }
              );
            });
        });
      } else if (data.intro == "Add an employee") {
        db.query(
          `SELECT 
        role.id AS role_id, 
        role.title AS title 
        FROM role`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const roleChoices = result.map((role) => ({
              name: role.title,
              value: role.role_id,
            }));
            db.query(
              `SELECT 
            employee.id AS manager_id,
            CONCAT(first_name, ' ', last_name) AS manager
        FROM employee`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                const managerChoices = result.map((employee) => ({
                  name: employee.manager,
                  value: employee.manager_id,
                }));
                managerChoices.unshift({ name: "None", value: null });
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
                      choices: roleChoices,
                      name: "role",
                    },
                    {
                      type: "list",
                      message: "Who is the employee's manager?",
                      choices: managerChoices,
                      name: "manager",
                    },
                  ])
                  .then(function (employee) {
                    console.log(employee);
                    const firstName = employee.firstName;
                    const lastName = employee.lastName;
                    const roleId = employee.role;
                    const managerId = employee.manager;
                    db.query(
                      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', '${roleId}', ${managerId})`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                        }
                        console.log(
                          `Added ${firstName} ${lastName} to the database.`
                        );
                        promptQuestions();
                      }
                    );
                  });
              }
            );
          }
        );
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
