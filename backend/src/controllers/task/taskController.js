import AsyncHandler from "express-async-handler";
import TaskModel from "../../models/tasks/TaskModel.js";


export const createTask = AsyncHandler(async (req, res) => {

    try{
        const{title,description,dueDate,priority,status}= req.body;

        if(!title || title.trim()==="") {
            res.status(400).json({message:"Title is required"});
            
        }
        if(!description || description.trim()==="") {
            res.status(400).json({message:"Description is required"});
            
        }

const task = new TaskModel({
    title,
    description,
    dueDate,
    priority,
    status,
    user: req.user._id,
});    

await task.save();

res.status(201).json(task);
    } catch(error) {
        console.log("Error in creating task", error.message);
        res.status(500).json({message:error.message});
    }
});


export const getTasks = AsyncHandler(async (req, res) => {
    try {
        const userId=req.user._id;

        if(!userId){
            res.status(400).json({message:"User id is required"});
        }

        const tasks=await TaskModel.find({user:userId});


        res.status(200).json({
            length:tasks.length,
            tasks,
        });
    } catch (error) {
        console.log("Error in getTasks", error.message);
        res.status(500).json({message:error.message});
    }

});


export const getTask = AsyncHandler(async (req, res) => {

    try {
            const userId=req.user._id;

            const {id} =req.params;

            if(!id){
                res.status(400).json({message:"please provide a task id"});
            }

            const task=await TaskModel.findById(id);

            if(!task){
                res.status(404).json({message:"Task not found"});
            }

            if(!task.user.equals(userId)){
                res.status(401).json({message:"You are not authorized to view this task"});
            }
        res.status(200).json(task);
    } catch (error) {
        console.log("Error in getTask", error.message);
        res.status(500).json({message:error.message});
    }
});


export const updateTask = AsyncHandler(async (req, res) => {
    try {
        const userId=req.user._id;

        const {id} =req.params;
        const{title,description,dueDate,priority,status,completed}= req.body;

        if(!id){
            res.status(400).json({message:"please provide a task id"});
        }



        const task=await TaskModel.findById(id);

        if(!task){
            res.status(404).json({message:"Task not found"});
        }


        //check if the user is authorized to update the task
        if(!task.user.equals(userId)){
            res.status(401).json({message:"You are not authorized to update this task"});   
        }

        //update the task with the new data if provided or keep the old data
        task.title=title || task.title;
        task.description=description || task.description;
        task.dueDate=dueDate || task.dueDate;
        task.priority=priority || task.priority;
        task.status=status || task.status;
        task.completed=completed || task.completed;

        await task.save();
        
        return res.status(200).json(task);

    } catch (error) {
        console.log("Error in updateTask", error.message);
        res.status(500).json({message:error.message});
        
    }
});


export const deleteTask = AsyncHandler(async (req, res) => {
    try {
        const userId=req.user._id;
        const {id} =req.params;

        const task = await TaskModel.findById(id);

        if(!task){
            res.status(404).json({message:"Task not found"});
        }
        //check if the user is authorized to delete the task
        if(!task.user.equals(userId)){
            res.status(401).json({message:"You are not authorized to delete this task"});   
        }
        await TaskModel.findByIdAndDelete(id);

        return res.status(200).json({message:"Task deleted successfully"});
    } catch (error) {
        console.log("Error in deleteTask", error.message);
        res.status(500).json({message:error.message});
        
    }
});