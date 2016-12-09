<?php

class fnXML
{
    //Получить XML строку из файла
    function getXMLstring($file)
    {
        if(file_exists($file))
        {
            return simplexml_load_file($file);
        }
        else
        {
            return false;
        }
    }


    /*function getAllFieldsXML($file){
        if(file_exists($file))
        {
            $xml = simplexml_load_file($file);
            $fid=$xml->fid;

           foreach($xml->fields as $item)
           {
               $number=$item->field->number;

           }
        }
    }*/
}